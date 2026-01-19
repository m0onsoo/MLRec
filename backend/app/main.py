from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
from .model_service import ModelService
from .metadata_service import MetadataService
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Movie Recommender API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
# Ideally these should be env vars
# Assuming running from 'backend' directory or project root
PROJECT_ROOT = "/Users/moonsoo/Desktop/MOON/공부/projects/MLRec"
# Lightweight data dir
DATA_DIR = os.path.join(PROJECT_ROOT, "backend/app/data")
# Decoupled Mode: Use the same data dir for metadata
DATASET_DIR = DATA_DIR

# Initialize Services
try:
    model_service = ModelService(data_dir=DATA_DIR)
    metadata_service = MetadataService(dataset_path=DATASET_DIR)
except Exception as e:
    print(f"Failed to initialize services: {e}")
    # In production we might want to fail hard, but locally we might want to debug
    model_service = None
    metadata_service = None

# Data Models
class RecommendationRequest(BaseModel):
    selected_movie_ids: List[str]
    k: int = 10

class MovieResponse(BaseModel):
    id: str
    title: str
    genres: str
    tmdbId: str | None = None

@app.get("/")
def read_root():
    return {"message": "Movie Recommender API is running"}

@app.get("/movies", response_model=List[MovieResponse])
def get_movies(search: str = None):
    """
    Get list of movies. If search is provided, filter by title.
    Otherwise return a default list (e.g. top 100).
    """
    if not metadata_service:
        raise HTTPException(status_code=503, detail="Services not initialized")
    
    if search:
        results = metadata_service.search_movies(search)
    else:
        results = metadata_service.get_all_movies(limit=100)
    
    return [
        MovieResponse(
            id=str(r["item_id"]), 
            title=r["title"], 
            genres=r["genres"],
            tmdbId=r.get("tmdbId")
        )
        for r in results
    ]

@app.post("/recommend", response_model=List[MovieResponse])
def recommend(request: RecommendationRequest):
    """
    Generate recommendations based on selected movie IDs.
    """
    if not model_service:
        raise HTTPException(status_code=503, detail="Services not initialized")
    
    try:
        recommended_ids = model_service.recommend_for_new_user(request.selected_movie_ids, k=request.k)
        
        response = []
        for mid in recommended_ids:
            # mid might be numpy int, convert to str
            mid_str = str(mid)
            details = metadata_service.get_movie_details(mid_str)
            response.append(MovieResponse(
                id=mid_str, 
                title=details["title"], 
                genres=details["genres"],
                tmdbId=details.get("tmdbId")
            ))
            
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
