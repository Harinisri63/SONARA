"""Seed script to populate initial catalog data for SONARA."""
import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db, get_engine
from app.database.base import Base
from app.models.entities import (
    Language, Genre, ArtistCategory, Artist, ArtistCategoryMap,
    Actor, Movie, MovieActor, Album, AlbumArtist, Song, SongArtist,
    SongGenre, MediaAsset
)

log = logging.getLogger("sonara.seed")

def seed_database(db: Session) -> None:
    # 1. Languages
    languages_data = [
        {"code": "ta", "name": "Tamil"},
        {"code": "te", "name": "Telugu"},
        {"code": "hi", "name": "Hindi"},
        {"code": "ml", "name": "Malayalam"},
        {"code": "kn", "name": "Kannada"},
        {"code": "en", "name": "English"},
    ]
    lang_map = {}
    for item in languages_data:
        existing = db.scalar(select(Language).where(Language.code == item["code"]))
        if not existing:
            existing = Language(code=item["code"], name=item["name"])
            db.add(existing)
            db.flush()
        lang_map[item["code"]] = existing

    # 2. Genres
    genres_data = [
        "Melody", "Romantic", "Classical", "Rock", "Pop", "Hip-hop", "Electronic", "Instrumental", "Lo-fi"
    ]
    genre_map = {}
    for gname in genres_data:
        existing = db.scalar(select(Genre).where(Genre.name == gname))
        if not existing:
            existing = Genre(name=gname)
            db.add(existing)
            db.flush()
        genre_map[gname] = existing

    # 3. Artist Categories
    cat_data = ["Music Composer", "Playback Singer", "Music Director", "Independent Artist", "Band"]
    cat_map = {}
    for cname in cat_data:
        existing = db.scalar(select(ArtistCategory).where(ArtistCategory.name == cname))
        if not existing:
            existing = ArtistCategory(name=cname)
            db.add(existing)
            db.flush()
        cat_map[cname] = existing

    # 4. Media Assets helper
    def get_or_create_asset(storage_key: str, kind: str, mime: str, duration: int = 240) -> MediaAsset:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.storage_key == storage_key))
        if not asset:
            asset = MediaAsset(
                storage_key=storage_key,
                kind=kind,
                mime_type=mime,
                size_bytes=1024 * 1024 * 5,
                duration_seconds=duration if kind == "audio" else None
            )
            db.add(asset)
            db.flush()
        return asset

    # Placeholder cover & audio assets
    cover_jailer = get_or_create_asset("covers/jailer.jpg", "image", "image/jpeg")
    cover_vikram = get_or_create_asset("covers/vikram.jpg", "image", "image/jpeg")
    cover_ps1 = get_or_create_asset("covers/ps1.jpg", "image", "image/jpeg")
    
    # Royalty-free stream sample
    sample_audio = get_or_create_asset("audio/sample_audio.mp3", "audio", "audio/mpeg", 215)

    # 5. Artists
    artists_info = [
        {
            "name": "Anirudh Ravichander",
            "bio": "Indian music composer and singer known for his high-energy futuristic anthems and global viral hits.",
            "country": "India",
            "is_featured": True,
            "cats": ["Music Composer", "Playback Singer"],
            "image": "artists/anirudh.jpg"
        },
        {
            "name": "A. R. Rahman",
            "bio": "Two-time Academy Award-winning composer, singer, and songwriter known as the Mozart of Madras.",
            "country": "India",
            "is_featured": True,
            "cats": ["Music Composer", "Music Director"],
            "image": "artists/ar_rahman.jpg"
        },
        {
            "name": "Ilaiyaraaja",
            "bio": "Legendary maestro who has composed over 7,000 songs, renowned for blending Western classical with Indian traditional harmony.",
            "country": "India",
            "is_featured": True,
            "cats": ["Music Composer", "Music Director"],
            "image": "artists/ilaiyaraaja.jpg"
        },
        {
            "name": "Sid Sriram",
            "bio": "Carnatic musician, singer and music producer recognized for his soulful vocal phrasing in modern melodies.",
            "country": "India",
            "is_featured": True,
            "cats": ["Playback Singer"],
            "image": "artists/sid_sriram.jpg"
        },
        {
            "name": "Shreya Ghoshal",
            "bio": "Leading Indian playback singer known for wide vocal versatility and recipient of five National Film Awards.",
            "country": "India",
            "is_featured": True,
            "cats": ["Playback Singer"],
            "image": "artists/shreya_ghoshal.jpg"
        }
    ]

    artist_map = {}
    for a in artists_info:
        art = db.scalar(select(Artist).where(Artist.name == a["name"]))
        if not art:
            img = get_or_create_asset(a["image"], "image", "image/jpeg")
            art = Artist(
                name=a["name"],
                bio=a["bio"],
                country=a["country"],
                is_featured=a["is_featured"],
                image_asset_id=img.id
            )
            db.add(art)
            db.flush()
            for c in a["cats"]:
                db.add(ArtistCategoryMap(artist_id=art.id, category_id=cat_map[c].id))
            db.flush()
        artist_map[a["name"]] = art

    # 6. Actors
    actors_info = [
        {
            "name": "Rajinikanth",
            "bio": "Superstar of Indian cinema with a career spanning five decades, acclaimed for unmatched style, charisma, and massive box office impact.",
            "is_featured": True,
            "image": "actors/rajinikanth.jpg"
        },
        {
            "name": "Kamal Haasan",
            "bio": "Polymath actor, director, producer, and playback singer widely recognized as one of cinema's finest performing artists.",
            "is_featured": True,
            "image": "actors/kamal_haasan.jpg"
        },
        {
            "name": "Vijay",
            "bio": "Leading superstar known as 'Thalapathy', dominating modern South Indian box office records with chart-topping musical tracks.",
            "is_featured": True,
            "image": "actors/vijay.jpg"
        }
    ]

    actor_map = {}
    for act in actors_info:
        existing = db.scalar(select(Actor).where(Actor.name == act["name"]))
        if not existing:
            img = get_or_create_asset(act["image"], "image", "image/jpeg")
            existing = Actor(
                name=act["name"],
                bio=act["bio"],
                is_featured=act["is_featured"],
                image_asset_id=img.id
            )
            db.add(existing)
            db.flush()
        actor_map[act["name"]] = existing

    # 7. Movies
    movies_info = [
        {
            "title": "Jailer",
            "release_year": 2023,
            "director": "Nelson Dilipkumar",
            "composer": "Anirudh Ravichander",
            "language": "ta",
            "poster": "movies/jailer.jpg",
            "lead_actor": "Rajinikanth",
            "character": "Muthuvel Pandian (Tiger)"
        },
        {
            "title": "Vikram",
            "release_year": 2022,
            "director": "Lokesh Kanagaraj",
            "composer": "Anirudh Ravichander",
            "language": "ta",
            "poster": "movies/vikram.jpg",
            "lead_actor": "Kamal Haasan",
            "character": "Agent Vikram / Amar"
        },
        {
            "title": "Ponniyin Selvan: Part 1",
            "release_year": 2022,
            "director": "Mani Ratnam",
            "composer": "A. R. Rahman",
            "language": "ta",
            "poster": "movies/ps1.jpg",
            "lead_actor": "Kamal Haasan",
            "character": "Narrator"
        }
    ]

    movie_map = {}
    for m in movies_info:
        mov = db.scalar(select(Movie).where(Movie.title == m["title"]))
        if not mov:
            poster = get_or_create_asset(m["poster"], "image", "image/jpeg")
            mov = Movie(
                title=m["title"],
                release_year=m["release_year"],
                director=m["director"],
                music_composer_artist_id=artist_map[m["composer"]].id,
                language_id=lang_map[m["language"]].id,
                poster_asset_id=poster.id
            )
            db.add(mov)
            db.flush()
            # Link Actor to Movie
            db.add(MovieActor(
                movie_id=mov.id,
                actor_id=actor_map[m["lead_actor"]].id,
                character_name=m["character"],
                billing_order=1
            ))
            db.flush()
        movie_map[m["title"]] = mov

    # 8. Albums (Soundtracks)
    albums_info = [
        {
            "title": "Jailer (Original Motion Picture Soundtrack)",
            "release_year": 2023,
            "movie": "Jailer",
            "primary_artist": "Anirudh Ravichander",
            "cover": cover_jailer
        },
        {
            "title": "Vikram (Original Motion Picture Soundtrack)",
            "release_year": 2022,
            "movie": "Vikram",
            "primary_artist": "Anirudh Ravichander",
            "cover": cover_vikram
        },
        {
            "title": "Ponniyin Selvan: Part 1 (Original Soundtrack)",
            "release_year": 2022,
            "movie": "Ponniyin Selvan: Part 1",
            "primary_artist": "A. R. Rahman",
            "cover": cover_ps1
        }
    ]

    album_map = {}
    for a in albums_info:
        alb = db.scalar(select(Album).where(Album.title == a["title"]))
        if not alb:
            alb = Album(
                title=a["title"],
                release_year=a["release_year"],
                movie_id=movie_map[a["movie"]].id,
                cover_asset_id=a["cover"].id,
                album_type="soundtrack"
            )
            db.add(alb)
            db.flush()
            db.add(AlbumArtist(album_id=alb.id, artist_id=artist_map[a["primary_artist"]].id))
            db.flush()
        album_map[a["title"]] = alb

    # 9. Songs
    songs_info = [
        {
            "title": "Hukum – Thalaivar Alappara",
            "album": "Jailer (Original Motion Picture Soundtrack)",
            "track_number": 1,
            "duration": 207,
            "language": "ta",
            "composer": "Anirudh Ravichander",
            "genre": "Rock",
            "mood": "Energizing",
            "plays": 12500000
        },
        {
            "title": "Kaavaalaa",
            "album": "Jailer (Original Motion Picture Soundtrack)",
            "track_number": 2,
            "duration": 191,
            "language": "ta",
            "composer": "Anirudh Ravichander",
            "genre": "Pop",
            "mood": "Festive",
            "plays": 18200000
        },
        {
            "title": "Vikram Title Track",
            "album": "Vikram (Original Motion Picture Soundtrack)",
            "track_number": 1,
            "duration": 215,
            "language": "ta",
            "composer": "Anirudh Ravichander",
            "genre": "Electronic",
            "mood": "Intense",
            "plays": 9500000
        },
        {
            "title": "Pathala Pathala",
            "album": "Vikram (Original Motion Picture Soundtrack)",
            "track_number": 2,
            "duration": 211,
            "language": "ta",
            "composer": "Anirudh Ravichander",
            "genre": "Pop",
            "mood": "Playful",
            "plays": 14000000
        },
        {
            "title": "Ponni Nadhi",
            "album": "Ponniyin Selvan: Part 1 (Original Soundtrack)",
            "track_number": 1,
            "duration": 295,
            "language": "ta",
            "composer": "A. R. Rahman",
            "genre": "Classical",
            "mood": "Majestic",
            "plays": 7800000
        },
        {
            "title": "Chola Chola",
            "album": "Ponniyin Selvan: Part 1 (Original Soundtrack)",
            "track_number": 2,
            "duration": 226,
            "language": "ta",
            "composer": "A. R. Rahman",
            "genre": "Melody",
            "mood": "Heroic",
            "plays": 6200000
        }
    ]

    for s in songs_info:
        song = db.scalar(select(Song).where(Song.title == s["title"]))
        if not song:
            song = Song(
                title=s["title"],
                album_id=album_map[s["album"]].id,
                track_number=s["track_number"],
                duration_seconds=s["duration"],
                language_id=lang_map[s["language"]].id,
                audio_asset_id=sample_audio.id,
                play_count=s["plays"],
                mood=s["mood"],
                is_published=True
            )
            db.add(song)
            db.flush()
            # Link SongArtist
            db.add(SongArtist(song_id=song.id, artist_id=artist_map[s["composer"]].id, role="composer"))
            # Link SongGenre
            db.add(SongGenre(song_id=song.id, genre_id=genre_map[s["genre"]].id))
            db.flush()

    db.commit()
    print("Database catalog successfully seeded with realistic entities!")

if __name__ == "__main__":
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    db_session = next(get_db())
    seed_database(db_session)
