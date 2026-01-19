import sys
import os
import torch
import json
import numpy as np
from logging import getLogger

# Add RecBole to sys.path
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), "RecBole")))

from recbole.utils import get_model, init_seed
from recbole.data import create_dataset, data_preparation

def export_lightweight_model(saved_dir='RecBole/saved', output_dir='backend/app/data'):
    # 1. Find latest checkpoint
    if not os.path.exists(saved_dir):
        raise FileNotFoundError(f"Directory '{saved_dir}' not found.")
    
    files = [f for f in os.listdir(saved_dir) if f.endswith('.pth')]
    if not files:
        raise FileNotFoundError(f"No .pth files found in '{saved_dir}'.")
    
    # Prioritize 'LightGCN-mlrec.pth' if it exists, otherwise use latest
    target_model = 'LightGCN-mlrec.pth'
    if target_model in files:
        model_path = os.path.join(saved_dir, target_model)
    else:
        files.sort(key=lambda x: os.path.getmtime(os.path.join(saved_dir, x)), reverse=True)
        model_path = os.path.join(saved_dir, files[0])
        
    print(f"Loading model from: {model_path}")

    # 2. Load Checkpoint
    checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)
    config = checkpoint["config"]
    
    # Override paths to work in this script context
    config['data_path'] = os.path.abspath("RecBole/dataset/ml-1m-mlrec")
    config['use_gpu'] = torch.cuda.is_available()
    config['device'] = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    init_seed(config["seed"], config["reproducibility"])

    # 3. Load Dataset & Model
    dataset = create_dataset(config)
    _, _, test_data = data_preparation(config, dataset)
    
    model = get_model(config["model"])(config, test_data._dataset).to(config['device'])
    model.load_state_dict(checkpoint["state_dict"])
    model.load_other_parameter(checkpoint.get("other_parameter"))
    model.eval()

    # 4. Extract Embeddings (Forward pass to get GCN-propagated embeddings)
    print("Extracting embeddings...")
    with torch.no_grad():
        _, item_all_embeddings = model.forward()
    
    # Move to CPU for saving
    item_embeddings_cpu = item_all_embeddings.cpu()

    # 5. Extract ID Mapping (External Movie ID -> Internal Item ID)
    # We need a map: "1" (Toy Story) -> 45 (Internal Index)
    # dataset.field2id_token[dataset.iid_field] gives the list of tokens.
    # The index in this list is the internal ID.
    
    iid_field = dataset.iid_field
    # Token list where index = internal_id (0 is PAD, usually)
    # RecBole: 0 is padding. internal IDs start from 1.
    # field2id_token: [PAD, '1', '2', '3'...]
    token_list = dataset.field2id_token[iid_field]
    
    # Create a dictionary for fast lookup in backend
    # External ID (str) -> Internal ID (int)
    # Note: token_list[i] is the external string ID for internal ID i.
    item_map = {token: i for i, token in enumerate(token_list)}
    
    # Also save the reverse map if needed? 
    # Actually we just need External -> Internal for input, and Internal -> External for output.
    # The backend can easily invert it or we save a list.
    
    # Let's save a list of external IDs where index serves as internal ID. 
    # That matches how we look up the embedding matrix index.
    # item_list = ["PAD", "1", "2"] -> item_embeddings[1] corresponds to "1"
    item_list = token_list.tolist()

    # 6. Save Artifacts
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    embedding_path = os.path.join(output_dir, 'item_embeddings.pt')
    torch.save(item_embeddings_cpu, embedding_path)
    print(f"Saved embeddings to {embedding_path}")

    map_path = os.path.join(output_dir, 'item_map.json')
    with open(map_path, 'w') as f:
        json.dump(item_list, f)
    print(f"Saved token map to {map_path}")

if __name__ == "__main__":
    export_lightweight_model()
