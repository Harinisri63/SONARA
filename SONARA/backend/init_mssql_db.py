"""Code-first schema creation and comprehensive database seeder for Microsoft SQL Server."""
import urllib.parse
import re
import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, text, select
from sqlalchemy.orm import Session, sessionmaker

from app.database.base import Base
import app.models.entities as models
from app.core.security import hash_password

RAW_ODBC_CONNECTION = "Server=(localdb)\\MSSQLLocalDB;Database=SONARA;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"

def get_mssql_engine(db_name: str = "SONARA", autocommit: bool = False):
    odbc_str = f"DRIVER={{ODBC Driver 18 for SQL Server}};Server=(localdb)\\MSSQLLocalDB;Database={db_name};Trusted_Connection=yes;TrustServerCertificate=yes;"
    url = f"mssql+pyodbc:///?odbc_connect={urllib.parse.quote_plus(odbc_str)}"
    kwargs = {}
    if autocommit:
        kwargs["isolation_level"] = "AUTOCOMMIT"
    return create_engine(url, **kwargs)

def drop_and_recreate_database():
    print("[1/4] Connecting to master database to drop and recreate SONARA if present...")
    master_engine = get_mssql_engine("master", autocommit=True)
    with master_engine.connect() as conn:
        conn.execute(text("""
        IF EXISTS (SELECT name FROM sys.databases WHERE name = N'SONARA')
        BEGIN
            ALTER DATABASE [SONARA] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
            DROP DATABASE [SONARA];
        END
        CREATE DATABASE [SONARA];
        """))
    print("Database SONARA fresh created successfully on (localdb)\\MSSQLLocalDB!")

def create_all_tables_code_first():
    print("[2/4] Executing Code-First Table Creation using Base.metadata.create_all()...")
    engine = get_mssql_engine("SONARA")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
    
    # Inspect tables in SQL Server
    with engine.connect() as conn:
        res = conn.execute(text("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME")).fetchall()
        table_names = [r[0] for r in res]
        print(f"Total tables created in SQL Server ({len(table_names)}):")
        for t in table_names:
            print(f"  - {t}")
        return engine

def seed_database_data(engine):
    print("[3/4] Seeding initial data (Roles, Users, Catalog, Media Assets, Songs, Favorites)...")
    SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    db: Session = SessionLocal()

    try:
        # 1. Seed Roles
        role_admin = models.Role(name="Admin")
        role_user = models.Role(name="User")
        role_artist = models.Role(name="Artist")
        role_curator = models.Role(name="Curator")
        db.add_all([role_admin, role_user, role_artist, role_curator])
        db.flush()

        # 2. Seed Users
        hashed_pwd = hash_password("AdminPassword123!")
        user_admin = models.User(
            email="admin@sonara.com",
            username="admin",
            full_name="Administrator",
            password_hash=hashed_pwd,
            is_active=True,
            email_verified=True
        )
        user_listener = models.User(
            email="listener@sonara.com",
            username="listener",
            full_name="Music Enthusiast",
            password_hash=hash_password("UserPassword123!"),
            is_active=True,
            email_verified=True
        )
        db.add_all([user_admin, user_listener])
        db.flush()

        # Assign user_role
        db.add(models.UserRole(user_id=user_admin.id, role_id=role_admin.id))
        db.add(models.UserRole(user_id=user_admin.id, role_id=role_user.id))
        db.add(models.UserRole(user_id=user_listener.id, role_id=role_user.id))
        db.flush()

        # 3. Seed Languages
        langs = [
            models.Language(code="ta", name="Tamil"),
            models.Language(code="te", name="Telugu"),
            models.Language(code="hi", name="Hindi"),
            models.Language(code="ml", name="Malayalam"),
            models.Language(code="kn", name="Kannada"),
            models.Language(code="en", name="English"),
        ]
        db.add_all(langs)
        db.flush()
        lang_map = {l.code: l for l in langs}

        # 4. Seed Genres
        genre_names = ["Melody", "Romantic", "Classical", "Rock", "Pop", "Hip-hop", "Electronic", "Instrumental", "Lo-fi"]
        genres = [models.Genre(name=g) for g in genre_names]
        db.add_all(genres)
        db.flush()
        genre_map = {g.name: g for g in genres}

        # 5. Seed Artist Categories
        cat_names = ["Music Composer", "Playback Singer", "Music Director", "Independent Artist", "Band"]
        cats = [models.ArtistCategory(name=c) for c in cat_names]
        db.add_all(cats)
        db.flush()
        cat_map = {c.name: c for c in cats}

        # 6. Media Assets
        def make_asset(key, kind, mime="image/jpeg", dur=None):
            asset = db.scalar(select(models.MediaAsset).where(models.MediaAsset.storage_key == key))
            if not asset:
                asset = models.MediaAsset(
                    storage_key=key,
                    kind=kind,
                    mime_type=mime,
                    size_bytes=5 * 1024 * 1024,
                    duration_seconds=dur,
                    uploaded_by=user_admin.id
                )
                db.add(asset)
                db.flush()
            return asset

        # Image Assets with real distinct CDN URLs
        img_anirudh = make_asset("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80", "image")
        img_arr = make_asset("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80", "image")
        img_harris = make_asset("https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80", "image")
        img_yuvan = make_asset("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80", "image")
        img_sid = make_asset("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80", "image")

        img_rajini = make_asset("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80", "image")
        img_kamal = make_asset("https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80", "image")
        img_vikram_actor = make_asset("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80", "image")

        img_jailer_cov = make_asset("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80", "image")
        img_vikram_cov = make_asset("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80", "image")
        img_ps1_cov = make_asset("https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80", "image")

        # Audio Assets
        audio_song1 = make_asset("audio/song_1.mp3", "audio", "audio/mpeg", 215)
        audio_song2 = make_asset("audio/song_2.mp3", "audio", "audio/mpeg", 191)
        audio_song3 = make_asset("audio/song_3.mp3", "audio", "audio/mpeg", 215)
        audio_song4 = make_asset("audio/song_4.mp3", "audio", "audio/mpeg", 211)
        audio_song5 = make_asset("audio/song_5.mp3", "audio", "audio/mpeg", 295)
        audio_song6 = make_asset("audio/song_6.mp3", "audio", "audio/mpeg", 226)
        audio_song7 = make_asset("audio/song_7.mp3", "audio", "audio/mpeg", 248)

        # 7. Artists
        art_anirudh = models.Artist(name="Anirudh Ravichander", bio="Futuristic anthems and viral hits.", country="India", is_featured=True, image_asset_id=img_anirudh.id)
        art_arr = models.Artist(name="A. R. Rahman", bio="Academy Award winning composer and maestro.", country="India", is_featured=True, image_asset_id=img_arr.id)
        art_harris = models.Artist(name="Harris Jayaraj", bio="Pioneering modern electronic melody arrangements.", country="India", is_featured=False, image_asset_id=img_harris.id)
        art_yuvan = models.Artist(name="Yuvan Shankar Raja", bio="BGM King and youth music pioneer.", country="India", is_featured=False, image_asset_id=img_yuvan.id)
        art_sid = models.Artist(name="Sid Sriram", bio="Soulful Carnatic and contemporary playback singer.", country="India", is_featured=False, image_asset_id=img_sid.id)
        db.add_all([art_anirudh, art_arr, art_harris, art_yuvan, art_sid])
        db.flush()

        db.add(models.ArtistCategoryMap(artist_id=art_anirudh.id, category_id=cat_map["Music Composer"].id))
        db.add(models.ArtistCategoryMap(artist_id=art_arr.id, category_id=cat_map["Music Composer"].id))
        db.add(models.ArtistCategoryMap(artist_id=art_harris.id, category_id=cat_map["Music Composer"].id))
        db.add(models.ArtistCategoryMap(artist_id=art_yuvan.id, category_id=cat_map["Music Composer"].id))
        db.add(models.ArtistCategoryMap(artist_id=art_sid.id, category_id=cat_map["Playback Singer"].id))
        db.flush()

        # 8. Actors
        act_rajini = models.Actor(name="Rajinikanth", bio="The iconic Superstar of Indian Cinema.", is_featured=True, image_asset_id=img_rajini.id)
        act_kamal = models.Actor(name="Kamal Haasan", bio="Ulaga Nayagan and legendary method actor.", is_featured=True, image_asset_id=img_kamal.id)
        act_vikram = models.Actor(name="Chiyaan Vikram", bio="Versatile performer known for extreme physical transformations.", is_featured=True, image_asset_id=img_vikram_actor.id)
        db.add_all([act_rajini, act_kamal, act_vikram])
        db.flush()

        # 9. Movies
        mov_jailer = models.Movie(title="Jailer", release_year=2023, director="Nelson Dilipkumar", poster_asset_id=img_jailer_cov.id, language_id=lang_map["ta"].id, music_composer_artist_id=art_anirudh.id)
        mov_vikram = models.Movie(title="Vikram", release_year=2022, director="Lokesh Kanagaraj", poster_asset_id=img_vikram_cov.id, language_id=lang_map["ta"].id, music_composer_artist_id=art_anirudh.id)
        mov_ps1 = models.Movie(title="Ponniyin Selvan: Part 1", release_year=2022, director="Mani Ratnam", poster_asset_id=img_ps1_cov.id, language_id=lang_map["ta"].id, music_composer_artist_id=art_arr.id)
        db.add_all([mov_jailer, mov_vikram, mov_ps1])
        db.flush()

        db.add(models.MovieActor(movie_id=mov_jailer.id, actor_id=act_rajini.id, character_name="Tiger Muthuvel Pandian", billing_order=1))
        db.add(models.MovieActor(movie_id=mov_vikram.id, actor_id=act_kamal.id, character_name="Agent Vikram", billing_order=1))
        db.add(models.MovieActor(movie_id=mov_ps1.id, actor_id=act_vikram.id, character_name="Aditha Karikalan", billing_order=1))
        db.flush()

        # 10. Albums
        alb_jailer = models.Album(title="Jailer (Original Motion Picture Soundtrack)", release_year=2023, cover_asset_id=img_jailer_cov.id, movie_id=mov_jailer.id, album_type="soundtrack")
        alb_vikram = models.Album(title="Vikram (Original Motion Picture Soundtrack)", release_year=2022, cover_asset_id=img_vikram_cov.id, movie_id=mov_vikram.id, album_type="soundtrack")
        alb_ps1 = models.Album(title="Ponniyin Selvan: Part 1 (Original Soundtrack)", release_year=2022, cover_asset_id=img_ps1_cov.id, movie_id=mov_ps1.id, album_type="soundtrack")
        db.add_all([alb_jailer, alb_vikram, alb_ps1])
        db.flush()

        db.add(models.AlbumArtist(album_id=alb_jailer.id, artist_id=art_anirudh.id))
        db.add(models.AlbumArtist(album_id=alb_vikram.id, artist_id=art_anirudh.id))
        db.add(models.AlbumArtist(album_id=alb_ps1.id, artist_id=art_arr.id))
        db.flush()

        # 11. Songs
        songs_data = [
            {
                "title": "Hukum - Thalaivar Alappara",
                "album": alb_jailer,
                "track_number": 1,
                "duration": 215,
                "language": lang_map["ta"],
                "audio": audio_song1,
                "composer": art_anirudh,
                "genre": genre_map["Rock"],
                "mood": "Energetic",
                "plays": 25400000
            },
            {
                "title": "Kaavaalaa",
                "album": alb_jailer,
                "track_number": 2,
                "duration": 191,
                "language": lang_map["ta"],
                "audio": audio_song2,
                "composer": art_anirudh,
                "genre": genre_map["Pop"],
                "mood": "Festive",
                "plays": 18200000
            },
            {
                "title": "Vikram Title Track",
                "album": alb_vikram,
                "track_number": 1,
                "duration": 215,
                "language": lang_map["ta"],
                "audio": audio_song3,
                "composer": art_anirudh,
                "genre": genre_map["Electronic"],
                "mood": "Intense",
                "plays": 9500000
            },
            {
                "title": "Pathala Pathala",
                "album": alb_vikram,
                "track_number": 2,
                "duration": 211,
                "language": lang_map["ta"],
                "audio": audio_song4,
                "composer": art_anirudh,
                "genre": genre_map["Pop"],
                "mood": "Playful",
                "plays": 14000000
            },
            {
                "title": "Ponni Nadhi",
                "album": alb_ps1,
                "track_number": 1,
                "duration": 295,
                "language": lang_map["ta"],
                "audio": audio_song5,
                "composer": art_arr,
                "genre": genre_map["Classical"],
                "mood": "Majestic",
                "plays": 7800000
            },
            {
                "title": "Chola Chola",
                "album": alb_ps1,
                "track_number": 2,
                "duration": 226,
                "language": lang_map["ta"],
                "audio": audio_song6,
                "composer": art_arr,
                "genre": genre_map["Melody"],
                "mood": "Heroic",
                "plays": 6200000
            },
            {
                "title": "Naa Ready (Electronic Anthem)",
                "album": alb_vikram,
                "track_number": 3,
                "duration": 248,
                "language": lang_map["ta"],
                "audio": audio_song7,
                "composer": art_anirudh,
                "genre": genre_map["Electronic"],
                "mood": "Hype",
                "plays": 12100000
            }
        ]

        created_songs = []
        for s in songs_data:
            song = models.Song(
                title=s["title"],
                album_id=s["album"].id,
                track_number=s["track_number"],
                duration_seconds=s["duration"],
                language_id=s["language"].id,
                audio_asset_id=s["audio"].id,
                play_count=s["plays"],
                mood=s["mood"],
                is_published=True
            )
            db.add(song)
            db.flush()
            db.add(models.SongArtist(song_id=song.id, artist_id=s["composer"].id, role="composer"))
            db.add(models.SongGenre(song_id=song.id, genre_id=s["genre"].id))
            created_songs.append(song)
            db.flush()

        # 12. Seed favourite_songs
        db.add(models.Favorite(user_id=user_admin.id, entity_type="song", entity_id=created_songs[0].id))
        db.add(models.Favorite(user_id=user_admin.id, entity_type="song", entity_id=created_songs[2].id))
        db.add(models.Favorite(user_id=user_listener.id, entity_type="song", entity_id=created_songs[1].id))
        db.flush()

        # 13. Seed Playlist
        playlist = models.Playlist(
            owner_user_id=user_admin.id,
            name="Superstar & Maestro Hits",
            description="Best immersive Tamil tracks in next-generation 3D spatial sound",
            is_public=True,
            cover_asset_id=img_jailer_cov.id
        )
        db.add(playlist)
        db.flush()

        for idx, csong in enumerate(created_songs[:5]):
            db.add(models.PlaylistSong(playlist_id=playlist.id, song_id=csong.id, position=idx + 1))
        db.flush()

        db.commit()
        print("Initial database seed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

def verify_table_data(engine):
    print("[4/4] Verifying Table Records in SQL Server...")
    with engine.connect() as conn:
        tables_to_check = [
            "role", "user", "user_role", "songs", "favourite_songs", 
            "artists", "actors", "movies", "albums", "playlists", "media_assets"
        ]
        for tbl in tables_to_check:
            count = conn.execute(text(f"SELECT COUNT(*) FROM [{tbl}]")).scalar()
            print(f"  * Table [{tbl}]: {count} rows")

if __name__ == "__main__":
    drop_and_recreate_database()
    engine = create_all_tables_code_first()
    seed_database_data(engine)
    verify_table_data(engine)
    print("\nALL TASKS COMPLETED SUCCESSFULLY!")
