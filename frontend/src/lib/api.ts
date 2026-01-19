import axios from 'axios';
import { Movie, RecommendationRequest } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getMovies = async (search?: string): Promise<Movie[]> => {
    const params = search ? { search } : {};
    const response = await api.get<Movie[]>('/movies', { params });
    return response.data;
};

export const getRecommendations = async (
    selectedMovieIds: string[],
    k: number = 10
): Promise<Movie[]> => {
    const request: RecommendationRequest = {
        selected_movie_ids: selectedMovieIds,
        k,
    };
    const response = await api.post<Movie[]>('/recommend', request);
    return response.data;
};
