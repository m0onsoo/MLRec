import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/lib/types';
import { getMovies } from '@/lib/api';
import { Search, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MovieSelectorProps {
    onSelectionChange: (selected: Movie[]) => void;
    selectedMovies: Movie[];
}

const MovieSelector: React.FC<MovieSelectorProps> = ({ onSelectionChange, selectedMovies }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                try {
                    const results = await getMovies(query);
                    setSearchResults(results);
                    setIsOpen(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const addMovie = (movie: Movie) => {
        if (selectedMovies.some(m => m.id === movie.id)) return;
        if (selectedMovies.length >= 10) return;

        const newSelection = [...selectedMovies, movie];
        onSelectionChange(newSelection);
        setQuery('');
        setIsOpen(false);
    };

    const removeMovie = (id: string) => {
        const newSelection = selectedMovies.filter(m => m.id !== id);
        onSelectionChange(newSelection);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6" ref={dropdownRef}>

            {/* Hero Search Bar */}
            <div className="relative group">
                <div className="flex items-center bg-black/60 border border-white/30 rounded focus-within:bg-black/80 focus-within:border-white transition-all overflow-hidden h-14 md:h-16 shadow-lg backdrop-blur-sm">
                    <div className="pl-4 text-gray-400">
                        <Search size={24} />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-transparent text-white px-4 py-2 text-lg md:text-xl placeholder-gray-400 focus:outline-none h-full"
                        style={{ color: '#ffffff' }}
                        placeholder="Search titles (e.g. Toy Story)"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            if (query.trim()) setIsOpen(true);
                        }}
                    />
                </div>

                {/* Results Dropdown */}
                <AnimatePresence>
                    {isOpen && searchResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#181818] border border-[#333] shadow-2xl overflow-hidden"
                        >
                            <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                                {searchResults.map(movie => {
                                    const isSelected = selectedMovies.some(m => m.id === movie.id);
                                    return (
                                        <button
                                            key={movie.id}
                                            onClick={() => !isSelected && addMovie(movie)}
                                            className={`w-full text-left p-4 flex items-center justify-between border-b border-[#333] last:border-0 hover:bg-[#2f2f2f] transition-colors
                            ${isSelected ? 'opacity-40 cursor-default' : 'cursor-pointer'}
                        `}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-white font-semibold text-sm md:text-base">{movie.title}</span>
                                                <span className="text-xs text-gray-500">{movie.genres.replace(/\|/g, ', ')}</span>
                                            </div>
                                            {!isSelected && <Plus size={18} className="text-gray-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Selected Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
                <AnimatePresence>
                    {selectedMovies.map(movie => (
                        <motion.div
                            key={movie.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex items-center bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1.5 rounded text-sm backdrop-blur-md transition-all"
                        >
                            <span className="mr-2 text-shadow-sm">{movie.title}</span>
                            <button
                                onClick={() => removeMovie(movie.id)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MovieSelector;
