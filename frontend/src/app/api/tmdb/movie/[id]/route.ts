import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'TMDB API Key missing' }, { status: 500 });
    }

    if (!id) {
        return NextResponse.json({ error: 'Missing movie ID' }, { status: 400 });
    }

    try {
        const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`);

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json({ poster_path: null }, { status: 200 });
            }
            throw new Error(`TMDB API Error: ${res.statusText}`);
        }

        const data = await res.json();
        return NextResponse.json({
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path
        });

    } catch (error) {
        console.error('TMDB Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
    }
}
