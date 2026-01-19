import pandas as pd
import os

class MetadataService:
    def __init__(self, dataset_path: str):
        self.movies_df = None
        self.dataset_path = dataset_path
        self._load_metadata()

    def _load_metadata(self):
        # Path to .item file (Decoupled: strictly in self.dataset_path)
        item_file = os.path.join(self.dataset_path, 'ml-1m-mlrec.item')
        if not os.path.exists(item_file):
             print(f"Metadata file not found at {item_file}")
             return

        try:
            # 1. Load Movie Data
            self.movies_df = pd.read_csv(item_file, sep='\t', dtype=str)
            self.movies_df.columns = [c.split(':')[0] for c in self.movies_df.columns]
            self.movies_df.set_index('item_id', inplace=True)
            
            # 2. Load Links Data (TMDB Mapping) (Decoupled: strictly in self.dataset_path)
            links_path = os.path.join(self.dataset_path, "links-preprocessed.csv")
            
            if os.path.exists(links_path):
                links_df = pd.read_csv(links_path, dtype=str)
                links_df.set_index('movieId', inplace=True)
                # Join: movies_df (index=item_id) + links_df (index=movieId)
                self.movies_df = self.movies_df.join(links_df[['tmdbId']], how='left')
                # Replace NaN with None (Pydantic requires None for optional strings, not NaN)
                self.movies_df['tmdbId'] = self.movies_df['tmdbId'].where(pd.notna(self.movies_df['tmdbId']), None)
            else:
                print(f"Warning: links.csv not found at {links_path}. TMDB images will not work.")

            print("Metadata loaded successfully.")
        except Exception as e:
            print(f"Error loading metadata: {e}")

    def get_movie_details(self, movie_id: str):
        if self.movies_df is None:
            return {"item_id": movie_id, "title": "Unknown", "genres": "", "tmdbId": None}
        
        if movie_id in self.movies_df.index:
            row = self.movies_df.loc[movie_id]
            return {
                "item_id": movie_id,
                "title": row.get('movie_title', 'Unknown'),
                "genres": row.get('genres', ''),
                "tmdbId": row.get('tmdbId', None)
            }
        return {"item_id": movie_id, "title": "Unknown", "genres": "", "tmdbId": None}

    def search_movies(self, query: str, limit=20):
        if self.movies_df is None:
            return []
        
        results = self.movies_df[self.movies_df['movie_title'].str.contains(query, case=False, na=False)]
        return [
            {
                "item_id": idx, 
                "title": row['movie_title'], 
                "genres": row['genres'],
                "tmdbId": row.get('tmdbId', None)
            }
            for idx, row in results.head(limit).iterrows()
        ]

    def get_all_movies(self, limit=1000):
        if self.movies_df is None:
            return []
        
        return [
            {
                "item_id": idx, 
                "title": row['movie_title'], 
                "genres": row['genres'],
                "tmdbId": row.get('tmdbId', None)
            }
            for idx, row in self.movies_df.head(limit).iterrows()
        ]
