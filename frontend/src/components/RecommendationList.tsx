import React from 'react';
import { Movie } from '@/lib/types';
import MovieCard from './MovieCard';

interface RecommendationListProps {
    movies: Movie[];
    isLoading: boolean;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ movies, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#E50914]"></div>
            </div>
        );
    }

    if (movies.length === 0) return null;

    return (
        <div className="px-4 md:px-12 pb-20 -mt-20 relative z-10 space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 ml-1 drop-shadow-md">Top Picks for You</h2>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto space-x-4 pb-40 pt-4 px-4 scrollbar-hide">
                {movies.map((movie, index) => (
                    <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
            </div>
        </div>
    );
};

export default RecommendationList;
