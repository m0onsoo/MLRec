import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus } from 'lucide-react';
import { Movie } from '@/lib/types';

interface MovieCardProps {
    movie: Movie;
    index: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, index }) => {
    const [posterPath, setPosterPath] = useState<string | null>(null);

    // Fetch TMDB Poster
    useEffect(() => {
        if (movie.tmdbId) {
            // TMDB API 호출 (개발 중에는 fetch를 직접 쓰거나, 본인의 API 라우트를 사용)
            // 참고: 실제 사용 시에는 본인의 API Key가 있는 서버 API를 경유하는 것이 안전합니다.
            // 여기서는 예시로 /api/tmdb/movie/... 경로를 가정합니다.
            fetch(`/api/tmdb/movie/${movie.tmdbId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.poster_path) {
                        setPosterPath(data.poster_path);
                    }
                })
                .catch(err => console.error("Failed to load poster", err));
        }
    }, [movie.tmdbId]);

    // 매치 점수 계산 로직 (예시)
    const matchScore = 98 - Math.min(index * 2, 15);
    const imageUrl = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative flex-none w-[140px] md:w-[180px]"
        >
            {/* 카드 메인 컨테이너 */}
            <div className="relative aspect-[2/3] w-full rounded-md bg-[#2f2f2f] overflow-hidden cursor-pointer shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:z-50 group-hover:shadow-2xl">

                {/* 1. 포스터 이미지 (Layer 0) */}
                {/* z-0을 명시하여 가장 아래에 배치 */}
                <div className="w-full h-full relative z-0">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
                            <span className="text-neutral-600 font-bold uppercase tracking-widest text-center px-2 text-[10px]">
                                {movie.title}
                            </span>
                        </div>
                    )}
                </div>

                {/* 2. 호버 오버레이 (Layer 20) */}
                {/* z-20으로 설정하여 이미지(z-0) 위에 확실하게 덮어씌움 */}
                <div className="absolute inset-0 bg-black/80 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">

                    {/* Top Section: Title & Match Score */}
                    {/* translate 효과로 부드럽게 나타나게 함 */}
                    <div className="transform translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="text-white font-bold text-sm leading-tight drop-shadow-md mb-1 line-clamp-2">
                            {movie.title}
                        </h4>
                        <span className="text-green-500 font-bold text-[10px]">{matchScore}% Match</span>
                    </div>

                    {/* Middle Section: Actions Buttons */}
                    {/* scale 효과로 팝업되는 느낌 */}
                    <div className="flex items-center justify-center gap-3 transform scale-90 group-hover:scale-100 transition-transform duration-300 delay-75">
                        <button className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors shadow-lg">
                            <Play size={20} fill="currentColor" />
                        </button>
                        <button className="border-2 border-gray-400 text-white p-3 rounded-full hover:border-white hover:bg-white/10 transition-colors">
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Bottom Section: Genres */}
                    {/* 아래에서 위로 올라오는 효과 */}
                    <div className="flex flex-wrap gap-1 transform translate-y-[10px] group-hover:translate-y-0 transition-transform duration-300 delay-100">
                        {movie.genres.split('|').slice(0, 3).map((g) => (
                            <span key={g} className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-medium backdrop-blur-sm">
                                {g}
                            </span>
                        ))}
                    </div>

                </div>
            </div>
        </motion.div>
    );
};

export default MovieCard;