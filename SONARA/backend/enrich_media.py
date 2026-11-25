import os
import sys

os.chdir("d:/PersonalProject/SONARA/SONARA/backend")
sys.path.insert(0, ".")

from sqlalchemy import select
from app.database.session import get_db
from app.models.entities import (
    Song, Artist, Actor, Movie, Album, MediaAsset
)

def enrich():
    db = next(get_db())

    def get_or_create(url: str, kind: str) -> int:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.storage_key == url))
        if not asset:
            asset = MediaAsset(
                storage_key=url,
                kind=kind,
                mime_type="audio/mpeg" if kind == "audio" else "image/jpeg",
                size_bytes=1024 * 1024 * 5
            )
            db.add(asset)
            db.flush()
        return asset.id

    # 1. Enrich Artists with online portraits
    artist_images = {
        "Anirudh Ravichander": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
        "A. R. Rahman": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
        "Ilaiyaraaja": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
        "Sid Sriram": "https://images.unsplash.com/photo-1520523839898-50712743e9d7?w=600&auto=format&fit=crop&q=80",
        "Shreya Ghoshal": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
    }
    for name, img in artist_images.items():
        art = db.scalar(select(Artist).where(Artist.name == name))
        if art:
            art.image_asset_id = get_or_create(img, "image")

    # 2. Enrich Actors with online portraits
    actor_images = {
        "Rajinikanth": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        "Kamal Haasan": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
        "Vijay": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80"
    }
    for name, img in actor_images.items():
        act = db.scalar(select(Actor).where(Actor.name == name))
        if act:
            act.image_asset_id = get_or_create(img, "image")

    # 3. Enrich Movies and Soundtrack Albums with online posters and covers
    media_data = [
        {
            "movie": "Jailer",
            "poster": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
            "album": "Jailer (Original Motion Picture Soundtrack)",
            "cover": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
        },
        {
            "movie": "Vikram",
            "poster": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
            "album": "Vikram (Original Motion Picture Soundtrack)",
            "cover": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80"
        },
        {
            "movie": "Ponniyin Selvan: Part 1",
            "poster": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
            "album": "Ponniyin Selvan: Part 1 (Original Soundtrack)",
            "cover": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80"
        }
    ]
    for item in media_data:
        m = db.scalar(select(Movie).where(Movie.title == item["movie"]))
        if m:
            m.poster_asset_id = get_or_create(item["poster"], "image")
        alb = db.scalar(select(Album).where(Album.title == item["album"]))
        if alb:
            alb.cover_asset_id = get_or_create(item["cover"], "image")

    # 4. Enrich Songs with real online streaming MP3 CDN audio tracks
    song_audio_urls = [
        ("Hukum – Thalaivar Alappara", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"),
        ("Kaavaalaa", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"),
        ("Vikram Title Track", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"),
        ("Pathala Pathala", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"),
        ("Ponni Nadhi", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"),
        ("Chola Chola", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"),
        ("Kanave", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3")
    ]
    for title, stream_url in song_audio_urls:
        s = db.scalar(select(Song).where(Song.title == title))
        if s:
            s.audio_asset_id = get_or_create(stream_url, "audio")

    db.commit()
    print("Catalog successfully enriched with online media assets and direct streaming tracks!")
    db.close()

if __name__ == "__main__":
    enrich()
