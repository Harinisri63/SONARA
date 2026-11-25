from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database.session import get_db
from app.models.entities import (
    Song, Artist, Actor, Movie, Album, Playlist, PlaylistSong,
    User, SongArtist, MovieActor, AlbumArtist, SongGenre, Genre,
    ArtistCategory, ArtistCategoryMap, MediaAsset
)
from app.features.authentication.dependencies import require_admin
from app.utils.youtube import is_youtube_url, download_youtube_audio

router = APIRouter(prefix="/admin", tags=["admin"])

# --- Media Asset Helpers ---

def get_or_create_media_asset(db: Session, url: str | None, kind: str) -> int | None:
    if not url or not url.strip():
        return None
    url = url.strip()

    # Automatically process YouTube audio links into cached local high-fidelity audio
    if kind == "audio" and is_youtube_url(url):
        yt_info = download_youtube_audio(url)
        if yt_info:
            url = yt_info["storage_key"]

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

def resolve_asset_url(db: Session, asset_id: int | None, fallback: str) -> str:
    if asset_id:
        asset = db.scalar(select(MediaAsset).where(MediaAsset.id == asset_id))
        if asset and asset.storage_key:
            return asset.storage_key
    return fallback

# --- Request / Response Schemas ---

class CreateSongIn(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    album_id: int | None = None
    custom_album_title: str | None = None
    artist_ids: list[int] = []
    custom_artist_names: str | None = None
    duration_seconds: int = 210
    mood: str | None = "Melodic"
    genre_ids: list[int] = []
    is_published: bool = True
    audio_url: str | None = None
    image_url: str | None = None

class UpdateSongIn(BaseModel):
    title: str | None = None
    album_id: int | None = None
    custom_album_title: str | None = None
    artist_ids: list[int] | None = None
    custom_artist_names: str | None = None
    duration_seconds: int | None = None
    mood: str | None = None
    genre_ids: list[int] | None = None
    is_published: bool | None = None
    audio_url: str | None = None
    image_url: str | None = None

class CreateArtistIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    bio: str | None = None
    country: str | None = "India"
    is_featured: bool = True
    categories: list[str] = ["Music Composer"]
    image_url: str | None = None

class UpdateArtistIn(BaseModel):
    name: str | None = None
    bio: str | None = None
    country: str | None = None
    is_featured: bool | None = None
    categories: list[str] | None = None
    image_url: str | None = None

class CreateActorIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    bio: str | None = None
    is_featured: bool = True
    image_url: str | None = None

class UpdateActorIn(BaseModel):
    name: str | None = None
    bio: str | None = None
    is_featured: bool | None = None
    image_url: str | None = None

class MovieCastItem(BaseModel):
    actor_id: int
    character_name: str | None = "Lead"

class CreateMovieIn(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    release_year: int = 2024
    director: str | None = None
    composer_artist_id: int | None = None
    cast: list[MovieCastItem] = []
    poster_url: str | None = None

class UpdateMovieIn(BaseModel):
    title: str | None = None
    release_year: int | None = None
    director: str | None = None
    composer_artist_id: int | None = None
    cast: list[MovieCastItem] | None = None
    poster_url: str | None = None

class CreateAlbumIn(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    release_year: int = 2024
    movie_id: int | None = None
    primary_artist_id: int | None = None
    album_type: str = "soundtrack"
    cover_url: str | None = None

class UpdateAlbumIn(BaseModel):
    title: str | None = None
    release_year: int | None = None
    movie_id: int | None = None
    primary_artist_id: int | None = None
    album_type: str | None = None
    cover_url: str | None = None

class CreateCuratedPlaylistIn(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str | None = None
    song_ids: list[int] = []
    is_public: bool = True

class UpdateCuratedPlaylistIn(BaseModel):
    name: str | None = None
    description: str | None = None
    song_ids: list[int] | None = None
    is_public: bool | None = None

# --- Endpoints ---

@router.get("/stats")
def get_stats(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_songs = db.scalar(select(func.count(Song.id)).where(Song.is_deleted == False)) or 0
    total_artists = db.scalar(select(func.count(Artist.id)).where(Artist.is_deleted == False)) or 0
    total_actors = db.scalar(select(func.count(Actor.id)).where(Actor.is_deleted == False)) or 0
    total_movies = db.scalar(select(func.count(Movie.id)).where(Movie.is_deleted == False)) or 0
    total_albums = db.scalar(select(func.count(Album.id)).where(Album.is_deleted == False)) or 0
    total_playlists = db.scalar(select(func.count(Playlist.id)).where(Playlist.is_deleted == False)) or 0
    total_users = db.scalar(select(func.count(User.id)).where(User.is_deleted == False)) or 0
    total_plays = db.scalar(select(func.sum(Song.play_count)).where(Song.is_deleted == False)) or 0

    return {
        "total_songs": total_songs,
        "total_artists": total_artists,
        "total_actors": total_actors,
        "total_movies": total_movies,
        "total_albums": total_albums,
        "total_playlists": total_playlists,
        "total_users": total_users,
        "total_plays": total_plays
    }

@router.get("/overview")
def get_catalog_overview(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    songs = db.scalars(select(Song).where(Song.is_deleted == False).order_by(Song.id.desc())).all()
    artists = db.scalars(select(Artist).where(Artist.is_deleted == False).order_by(Artist.name)).all()
    actors = db.scalars(select(Actor).where(Actor.is_deleted == False).order_by(Actor.name)).all()
    movies = db.scalars(select(Movie).where(Movie.is_deleted == False).order_by(Movie.title)).all()
    albums = db.scalars(select(Album).where(Album.is_deleted == False).order_by(Album.title)).all()
    playlists = db.scalars(select(Playlist).where(Playlist.is_deleted == False).order_by(Playlist.id.desc())).all()
    genres = db.scalars(select(Genre).order_by(Genre.name)).all()

    songs_data = []
    for s in songs:
        audio_url = resolve_asset_url(db, s.audio_asset_id, f"/api/v1/stream/{s.id}")
        image_url = None
        if s.album_id:
            alb = db.scalar(select(Album).where(Album.id == s.album_id))
            if alb:
                image_url = resolve_asset_url(db, alb.cover_asset_id, f"/assets/albums/{alb.id}.jpg")
        
        art_ids = [sa.artist_id for sa in db.scalars(select(SongArtist).where(SongArtist.song_id == s.id)).all()]
        g_ids = [sg.genre_id for sg in db.scalars(select(SongGenre).where(SongGenre.song_id == s.id)).all()]

        songs_data.append({
            "id": s.id,
            "title": s.title,
            "duration": s.duration_seconds,
            "plays": s.play_count,
            "mood": s.mood,
            "album_id": s.album_id,
            "artist_ids": art_ids,
            "genre_ids": g_ids,
            "audio_url": audio_url,
            "image_url": image_url,
            "is_published": s.is_published
        })

    artists_data = [
        {
            "id": a.id,
            "name": a.name,
            "bio": a.bio,
            "country": a.country,
            "is_featured": a.is_featured,
            "image_url": resolve_asset_url(db, a.image_asset_id, f"/assets/artists/{a.id}.jpg"),
            "categories": [c.name for c in a.categories]
        }
        for a in artists
    ]

    actors_data = [
        {
            "id": act.id,
            "name": act.name,
            "bio": act.bio,
            "is_featured": act.is_featured,
            "image_url": resolve_asset_url(db, act.image_asset_id, f"/assets/actors/{act.id}.jpg")
        }
        for act in actors
    ]

    movies_data = [
        {
            "id": m.id,
            "title": m.title,
            "year": m.release_year,
            "director": m.director,
            "composer_artist_id": m.music_composer_artist_id,
            "poster_url": resolve_asset_url(db, m.poster_asset_id, f"/assets/movies/{m.id}.jpg")
        }
        for m in movies
    ]

    albums_data = [
        {
            "id": alb.id,
            "title": alb.title,
            "year": alb.release_year,
            "movie_id": alb.movie_id,
            "type": alb.album_type,
            "cover_url": resolve_asset_url(db, alb.cover_asset_id, f"/assets/albums/{alb.id}.jpg")
        }
        for alb in albums
    ]

    playlists_data = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "is_public": p.is_public
        }
        for p in playlists
    ]

    return {
        "songs": songs_data,
        "artists": artists_data,
        "actors": actors_data,
        "movies": movies_data,
        "albums": albums_data,
        "playlists": playlists_data,
        "genres": [{"id": g.id, "name": g.name} for g in genres]
    }

# --- SONGS CRUD ---

@router.post("/songs", status_code=status.HTTP_201_CREATED)
def add_song(
    body: CreateSongIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    duration = body.duration_seconds
    if body.audio_url and is_youtube_url(body.audio_url):
        yt_info = download_youtube_audio(body.audio_url)
        if yt_info:
            duration = yt_info.get("duration") or duration

    audio_asset_id = get_or_create_media_asset(db, body.audio_url, "audio")

    # Handle Custom Album
    album_id = body.album_id if (body.album_id and body.album_id != -1) else None
    if body.custom_album_title and body.custom_album_title.strip():
        album_title = body.custom_album_title.strip()
        existing_alb = db.scalar(select(Album).where(func.lower(Album.title) == album_title.lower(), Album.is_deleted == False))
        if existing_alb:
            album_id = existing_alb.id
        else:
            cover_asset_id = get_or_create_media_asset(db, body.image_url, "image")
            new_alb = Album(title=album_title, album_type="album", release_year=2024, cover_asset_id=cover_asset_id)
            db.add(new_alb)
            db.flush()
            album_id = new_alb.id

    song = Song(
        title=body.title,
        album_id=album_id,
        duration_seconds=duration,
        mood=body.mood,
        audio_asset_id=audio_asset_id,
        is_published=body.is_published,
        play_count=0
    )
    db.add(song)
    db.flush()

    # Handle Artists & Custom Artists
    final_artist_ids = list(body.artist_ids or [])
    if body.custom_artist_names and body.custom_artist_names.strip():
        for name in [n.strip() for n in body.custom_artist_names.split(",") if n.strip()]:
            existing_art = db.scalar(select(Artist).where(func.lower(Artist.name) == name.lower(), Artist.is_deleted == False))
            if existing_art:
                if existing_art.id not in final_artist_ids:
                    final_artist_ids.append(existing_art.id)
            else:
                new_art = Artist(name=name, is_featured=True, country="Global")
                db.add(new_art)
                db.flush()
                final_artist_ids.append(new_art.id)

    for aid in final_artist_ids:
        db.add(SongArtist(song_id=song.id, artist_id=aid, role="singer"))

    for gid in body.genre_ids:
        db.add(SongGenre(song_id=song.id, genre_id=gid))

    db.commit()
    db.refresh(song)
    return {"message": "Song added successfully", "song_id": song.id, "title": song.title}

@router.put("/songs/{song_id}")
def update_song(
    song_id: int,
    body: UpdateSongIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    song = db.scalar(select(Song).where(Song.id == song_id, Song.is_deleted == False))
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    if body.title is not None:
        song.title = body.title

    if body.custom_album_title and body.custom_album_title.strip():
        album_title = body.custom_album_title.strip()
        existing_alb = db.scalar(select(Album).where(func.lower(Album.title) == album_title.lower(), Album.is_deleted == False))
        if existing_alb:
            song.album_id = existing_alb.id
        else:
            cover_asset_id = get_or_create_media_asset(db, body.image_url, "image")
            new_alb = Album(title=album_title, album_type="album", release_year=2024, cover_asset_id=cover_asset_id)
            db.add(new_alb)
            db.flush()
            song.album_id = new_alb.id
    elif body.album_id is not None:
        song.album_id = body.album_id if (body.album_id != 0 and body.album_id != -1) else None

    if body.duration_seconds is not None:
        song.duration_seconds = body.duration_seconds
    if body.mood is not None:
        song.mood = body.mood
    if body.is_published is not None:
        song.is_published = body.is_published
    if body.audio_url is not None:
        song.audio_asset_id = get_or_create_media_asset(db, body.audio_url, "audio")

    # Replace / update artists including custom artists
    final_artist_ids = list(body.artist_ids) if body.artist_ids is not None else None
    if body.custom_artist_names and body.custom_artist_names.strip():
        if final_artist_ids is None:
            final_artist_ids = [sa.artist_id for sa in db.scalars(select(SongArtist).where(SongArtist.song_id == song.id)).all()]
        for name in [n.strip() for n in body.custom_artist_names.split(",") if n.strip()]:
            existing_art = db.scalar(select(Artist).where(func.lower(Artist.name) == name.lower(), Artist.is_deleted == False))
            if existing_art:
                if existing_art.id not in final_artist_ids:
                    final_artist_ids.append(existing_art.id)
            else:
                new_art = Artist(name=name, is_featured=True, country="Global")
                db.add(new_art)
                db.flush()
                final_artist_ids.append(new_art.id)

    if final_artist_ids is not None:
        db.query(SongArtist).filter(SongArtist.song_id == song.id).delete()
        for aid in final_artist_ids:
            db.add(SongArtist(song_id=song.id, artist_id=aid, role="singer"))

    if body.genre_ids is not None:
        # replace genres
        db.query(SongGenre).filter(SongGenre.song_id == song.id).delete()
        for gid in body.genre_ids:
            db.add(SongGenre(song_id=song.id, genre_id=gid))

    db.commit()
    db.refresh(song)
    return {"message": "Song updated successfully", "song_id": song.id, "title": song.title}

@router.delete("/songs/{song_id}")
def delete_song(
    song_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    song = db.scalar(select(Song).where(Song.id == song_id, Song.is_deleted == False))
    if not song:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Song not found")

    song.is_deleted = True
    db.commit()
    return {"message": f"Song {song_id} marked as deleted"}

# --- ARTISTS CRUD ---

@router.post("/artists", status_code=status.HTTP_201_CREATED)
def add_artist(
    body: CreateArtistIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    image_asset_id = get_or_create_media_asset(db, body.image_url, "image")

    artist = Artist(
        name=body.name,
        bio=body.bio,
        country=body.country,
        image_asset_id=image_asset_id,
        is_featured=body.is_featured
    )
    db.add(artist)
    db.flush()

    for cname in body.categories:
        cat = db.scalar(select(ArtistCategory).where(ArtistCategory.name == cname))
        if not cat:
            cat = ArtistCategory(name=cname)
            db.add(cat)
            db.flush()
        db.add(ArtistCategoryMap(artist_id=artist.id, category_id=cat.id))

    db.commit()
    db.refresh(artist)
    return {"message": "Artist added successfully", "artist_id": artist.id, "name": artist.name}

@router.put("/artists/{artist_id}")
def update_artist(
    artist_id: int,
    body: UpdateArtistIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    artist = db.scalar(select(Artist).where(Artist.id == artist_id, Artist.is_deleted == False))
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    if body.name is not None:
        artist.name = body.name
    if body.bio is not None:
        artist.bio = body.bio
    if body.country is not None:
        artist.country = body.country
    if body.is_featured is not None:
        artist.is_featured = body.is_featured
    if body.image_url is not None:
        artist.image_asset_id = get_or_create_media_asset(db, body.image_url, "image")

    if body.categories is not None:
        db.query(ArtistCategoryMap).filter(ArtistCategoryMap.artist_id == artist.id).delete()
        for cname in body.categories:
            cat = db.scalar(select(ArtistCategory).where(ArtistCategory.name == cname))
            if not cat:
                cat = ArtistCategory(name=cname)
                db.add(cat)
                db.flush()
            db.add(ArtistCategoryMap(artist_id=artist.id, category_id=cat.id))

    db.commit()
    db.refresh(artist)
    return {"message": "Artist updated successfully", "artist_id": artist.id, "name": artist.name}

@router.delete("/artists/{artist_id}")
def delete_artist(
    artist_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    artist = db.scalar(select(Artist).where(Artist.id == artist_id, Artist.is_deleted == False))
    if not artist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Artist not found")

    artist.is_deleted = True
    db.commit()
    return {"message": f"Artist {artist_id} marked as deleted"}

# --- ACTORS CRUD ---

@router.post("/actors", status_code=status.HTTP_201_CREATED)
def add_actor(
    body: CreateActorIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    image_asset_id = get_or_create_media_asset(db, body.image_url, "image")

    actor = Actor(
        name=body.name,
        bio=body.bio,
        image_asset_id=image_asset_id,
        is_featured=body.is_featured
    )
    db.add(actor)
    db.commit()
    db.refresh(actor)
    return {"message": "Actor added successfully", "actor_id": actor.id, "name": actor.name}

@router.put("/actors/{actor_id}")
def update_actor(
    actor_id: int,
    body: UpdateActorIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    actor = db.scalar(select(Actor).where(Actor.id == actor_id, Actor.is_deleted == False))
    if not actor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found")

    if body.name is not None:
        actor.name = body.name
    if body.bio is not None:
        actor.bio = body.bio
    if body.is_featured is not None:
        actor.is_featured = body.is_featured
    if body.image_url is not None:
        actor.image_asset_id = get_or_create_media_asset(db, body.image_url, "image")

    db.commit()
    db.refresh(actor)
    return {"message": "Actor updated successfully", "actor_id": actor.id, "name": actor.name}

@router.delete("/actors/{actor_id}")
def delete_actor(
    actor_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    actor = db.scalar(select(Actor).where(Actor.id == actor_id, Actor.is_deleted == False))
    if not actor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Actor not found")

    actor.is_deleted = True
    db.commit()
    return {"message": f"Actor {actor_id} marked as deleted"}

# --- MOVIES CRUD ---

@router.post("/movies", status_code=status.HTTP_201_CREATED)
def add_movie(
    body: CreateMovieIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    poster_asset_id = get_or_create_media_asset(db, body.poster_url, "image")

    movie = Movie(
        title=body.title,
        release_year=body.release_year,
        director=body.director,
        music_composer_artist_id=body.composer_artist_id,
        poster_asset_id=poster_asset_id
    )
    db.add(movie)
    db.flush()

    for idx, c in enumerate(body.cast):
        db.add(MovieActor(
            movie_id=movie.id,
            actor_id=c.actor_id,
            character_name=c.character_name,
            billing_order=idx + 1
        ))

    db.commit()
    db.refresh(movie)
    return {"message": "Movie added successfully", "movie_id": movie.id, "title": movie.title}

@router.put("/movies/{movie_id}")
def update_movie(
    movie_id: int,
    body: UpdateMovieIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    movie = db.scalar(select(Movie).where(Movie.id == movie_id, Movie.is_deleted == False))
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    if body.title is not None:
        movie.title = body.title
    if body.release_year is not None:
        movie.release_year = body.release_year
    if body.director is not None:
        movie.director = body.director
    if body.composer_artist_id is not None:
        movie.music_composer_artist_id = body.composer_artist_id if body.composer_artist_id != 0 else None
    if body.poster_url is not None:
        movie.poster_asset_id = get_or_create_media_asset(db, body.poster_url, "image")

    if body.cast is not None:
        db.query(MovieActor).filter(MovieActor.movie_id == movie.id).delete()
        for idx, c in enumerate(body.cast):
            db.add(MovieActor(
                movie_id=movie.id,
                actor_id=c.actor_id,
                character_name=c.character_name,
                billing_order=idx + 1
            ))

    db.commit()
    db.refresh(movie)
    return {"message": "Movie updated successfully", "movie_id": movie.id, "title": movie.title}

@router.delete("/movies/{movie_id}")
def delete_movie(
    movie_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    movie = db.scalar(select(Movie).where(Movie.id == movie_id, Movie.is_deleted == False))
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")

    movie.is_deleted = True
    db.commit()
    return {"message": f"Movie {movie_id} marked as deleted"}

# --- ALBUMS CRUD ---

@router.post("/albums", status_code=status.HTTP_201_CREATED)
def add_album(
    body: CreateAlbumIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    cover_asset_id = get_or_create_media_asset(db, body.cover_url, "image")

    album = Album(
        title=body.title,
        release_year=body.release_year,
        movie_id=body.movie_id,
        album_type=body.album_type,
        cover_asset_id=cover_asset_id
    )
    db.add(album)
    db.flush()

    if body.primary_artist_id:
        db.add(AlbumArtist(album_id=album.id, artist_id=body.primary_artist_id))

    db.commit()
    db.refresh(album)
    return {"message": "Album created successfully", "album_id": album.id, "title": album.title}

@router.put("/albums/{album_id}")
def update_album(
    album_id: int,
    body: UpdateAlbumIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    album = db.scalar(select(Album).where(Album.id == album_id, Album.is_deleted == False))
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    if body.title is not None:
        album.title = body.title
    if body.release_year is not None:
        album.release_year = body.release_year
    if body.movie_id is not None:
        album.movie_id = body.movie_id if body.movie_id != 0 else None
    if body.album_type is not None:
        album.album_type = body.album_type
    if body.cover_url is not None:
        album.cover_asset_id = get_or_create_media_asset(db, body.cover_url, "image")

    if body.primary_artist_id is not None:
        db.query(AlbumArtist).filter(AlbumArtist.album_id == album.id).delete()
        if body.primary_artist_id != 0:
            db.add(AlbumArtist(album_id=album.id, artist_id=body.primary_artist_id))

    db.commit()
    db.refresh(album)
    return {"message": "Album updated successfully", "album_id": album.id, "title": album.title}

@router.delete("/albums/{album_id}")
def delete_album(
    album_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    album = db.scalar(select(Album).where(Album.id == album_id, Album.is_deleted == False))
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    album.is_deleted = True
    db.commit()
    return {"message": f"Album {album_id} marked as deleted"}

# --- PLAYLISTS CRUD ---

@router.post("/playlists", status_code=status.HTTP_201_CREATED)
def create_curated_playlist(
    body: CreateCuratedPlaylistIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    playlist = Playlist(
        owner_user_id=admin.id,
        name=body.name,
        description=body.description,
        is_public=body.is_public
    )
    db.add(playlist)
    db.flush()

    for idx, sid in enumerate(body.song_ids):
        db.add(PlaylistSong(playlist_id=playlist.id, song_id=sid, sort_order=idx + 1))

    db.commit()
    db.refresh(playlist)
    return {"message": "Curated playlist created", "playlist_id": playlist.id, "name": playlist.name}

@router.put("/playlists/{playlist_id}")
def update_curated_playlist(
    playlist_id: int,
    body: UpdateCuratedPlaylistIn,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    playlist = db.scalar(select(Playlist).where(Playlist.id == playlist_id, Playlist.is_deleted == False))
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    if body.name is not None:
        playlist.name = body.name
    if body.description is not None:
        playlist.description = body.description
    if body.is_public is not None:
        playlist.is_public = body.is_public

    if body.song_ids is not None:
        db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist.id).delete()
        for idx, sid in enumerate(body.song_ids):
            db.add(PlaylistSong(playlist_id=playlist.id, song_id=sid, sort_order=idx + 1))

    db.commit()
    db.refresh(playlist)
    return {"message": "Playlist updated successfully", "playlist_id": playlist.id, "name": playlist.name}

@router.delete("/playlists/{playlist_id}")
def delete_playlist(
    playlist_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    playlist = db.scalar(select(Playlist).where(Playlist.id == playlist_id, Playlist.is_deleted == False))
    if not playlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Playlist not found")

    playlist.is_deleted = True
    db.commit()
    return {"message": f"Playlist {playlist_id} deleted successfully"}
