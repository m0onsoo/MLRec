export interface Movie {
    id: string;
    title: string;
    genres: string;
    tmdbId?: string;
}

export interface RecommendationRequest {
    selected_movie_ids: string[];
    k: number;
}
