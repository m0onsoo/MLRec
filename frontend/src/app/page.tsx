'use client';

import React, { useState, useEffect } from 'react';
import MovieSelector from '@/components/MovieSelector';
import RecommendationList from '@/components/RecommendationList';
import { getRecommendations } from '@/lib/api';
import { Movie } from '@/lib/types';
import { Search, Bell, User } from 'lucide-react';

export default function Home() {
    const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasRecommended, setHasRecommended] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll for sticky navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleRecommend = async () => {
        if (selectedMovies.length === 0) return;

        setIsLoading(true);
        setHasRecommended(true);

        // Smooth scroll to results
        setTimeout(() => {
            window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' });
        }, 100);

        try {
            const selectedIds = selectedMovies.map(m => m.id);
            const results = await getRecommendations(selectedIds);
            setRecommendations(results);
        } catch (error) {
            console.error("Failed to get recommendations", error);
            alert("Failed to fetch recommendations. Ensure backend is running.");
            setHasRecommended(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#141414] text-white font-sans selection:bg-[#E50914] selection:text-white">

            {/* Sticky Navbar */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between
            ${scrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'}
        `}
            >
                <div className="flex items-center gap-8">
                    <h1 className="text-[#E50914] text-3xl font-bold tracking-tighter uppercase cursor-pointer">MovieRec</h1>
                    <div className="hidden md:flex gap-4 text-sm font-medium text-[#e5e5e5]">
                        <span className="hover:text-[#b3b3b3] transition cursor-pointer">Home</span>
                        <span className="font-bold cursor-pointer">Start</span>
                        <span className="hover:text-[#b3b3b3] transition cursor-pointer">My List</span>
                    </div>
                </div>

                <div className="flex items-center gap-5 text-white">
                    <Search className="w-5 h-5 cursor-pointer" />
                    <Bell className="w-5 h-5 cursor-pointer" />
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                            <User size={18} />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-[80vh] w-full flex flex-col justify-center items-center text-center px-4">

                {/* Background Image */}
                <div className="absolute inset-0 -z-10 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/dace47b4-a5cb-4368-80fe-c26f3e77d540/web/KR-en-20231023-popsignuptwoweeks-perspective_alpha_website_large.jpg')] bg-cover bg-center opacity-60"></div>
                {/* Fallback pattern if image fails or for better load */}
                <div className="absolute inset-0 -z-10 bg-black/40"></div>

                {/* Vignette Overlay */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#141414] via-transparent to-black/60"></div>

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-4xl space-y-6 animate-fadeIn">
                    <h2 className="text-4xl md:text-6xl font-black drop-shadow-lg">
                        Your Personal AI Curator.
                    </h2>
                    <p className="text-lg md:text-2xl font-medium drop-shadow-md">
                        Select your favorites. Get discovered.
                    </p>

                    {/* Input Component */}
                    <div className="pt-4">
                        <MovieSelector
                            selectedMovies={selectedMovies}
                            onSelectionChange={setSelectedMovies}
                        />

                        <div className="mt-8">
                            <button
                                onClick={handleRecommend}
                                disabled={selectedMovies.length === 0 || isLoading}
                                className={`
                        px-8 py-4 bg-[#E50914] text-white rounded font-bold text-2xl flex items-center gap-2 mx-auto hover:bg-[#b2070f] transition-all
                        ${selectedMovies.length === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-105 shadow-xl shadow-black/50'}
                    `}
                            >
                                {isLoading ? 'Processing...' : 'Get Recommendations'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="relative z-20 min-h-[50vh] bg-[#141414]">
                {hasRecommended && (
                    <RecommendationList movies={recommendations} isLoading={isLoading} />
                )}

                {!hasRecommended && !isLoading && (
                    <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
                        Select movies above to see results.
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="py-12 px-12 bg-[#141414] text-[#808080] text-sm">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>FAQ</div>
                    <div>Help Center</div>
                    <div>Terms of Use</div>
                    <div>Privacy</div>
                </div>
            </footer>
        </main>
    );
}
