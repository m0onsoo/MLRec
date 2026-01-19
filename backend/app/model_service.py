import os
import torch
import json
import numpy as np

class ModelService:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.item_embeddings = None
        self.id_to_token = [] # List where index is internal ID
        self.token_to_id = {} # Map external ID -> internal ID
        self.device = torch.device("cpu") # Default to CPU for lightweight web serving
        
        self._load_data()

    def _load_data(self):
        print(f"Loading lightweight model from: {self.data_dir}")
        
        # 1. Load Embeddings
        emb_path = os.path.join(self.data_dir, 'item_embeddings.pt')
        if not os.path.exists(emb_path):
            raise FileNotFoundError(f"Embeddings not found at {emb_path}")
        
        self.item_embeddings = torch.load(emb_path, map_location=self.device)
        
        # 2. Load ID Map
        map_path = os.path.join(self.data_dir, 'item_map.json')
        if not os.path.exists(map_path):
            raise FileNotFoundError(f"ID Map not found at {map_path}")
        
        with open(map_path, 'r') as f:
            self.id_to_token = json.load(f)
            
        self.token_to_id = {token: i for i, token in enumerate(self.id_to_token)}
        
        # [Fix] Normalize embeddings to reduce popularity bias (magnitude dominance)
        # RecBole LightGCN embeddings often correlate norm with popularity. 
        # For better qualitative results (Cosine Similarity), we normalize them.
        self.item_embeddings = torch.nn.functional.normalize(self.item_embeddings, p=2, dim=1)
        
        print(f"Lightweight model loaded successfully. Embeddings normalized. Shape: {self.item_embeddings.shape}")

    def recommend_for_new_user(self, selected_movie_ids: list[str], k=10):
        """
        Generate recommendations using simple vector similarity.
        """
        if self.item_embeddings is None:
            raise RuntimeError("Model not loaded")

        # 1. Map external IDs to internal indices
        internal_ids = []
        for mid in selected_movie_ids:
            if mid in self.token_to_id:
                internal_ids.append(self.token_to_id[mid])
            else:
                # Ignore unknown items
                pass
        
        if not internal_ids:
            return []

        # 2. Average User Embedding
        # indices = torch.tensor(internal_ids, device=self.device)
        # Note: item_embeddings is [num_items, dim]
        
        # We can just iterate to be safe or use fancy indexing
        selected_embs = self.item_embeddings[internal_ids]
        user_emb = torch.mean(selected_embs, dim=0).unsqueeze(0) # [1, dim]
        
        # 3. Compute Scores
        # scores = user_emb @ item_embs.T
        scores = torch.matmul(user_emb, self.item_embeddings.transpose(0, 1)).squeeze()
        
        # 4. Filter selected items
        scores[internal_ids] = -float('inf')
        
        # 5. Top K
        # 0 is usually PAD in RecBole, we might want to exclude it if it has 0 embedding
        # usually PAD embedding is 0 or random. Better mask it out just in case.
        scores[0] = -float('inf') 

        topk_scores, topk_indices = torch.topk(scores, k=k)
        
        # 6. Map back to external
        results = []
        for idx in topk_indices.tolist():
            results.append(self.id_to_token[idx])
            
        return results
