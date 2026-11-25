"""Verifies the actor -> movie -> soundtrack -> song chain and key constraints."""
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models import (Actor, Album, Favorite, Movie, MovieActor, Playlist, PlaylistSong, Song, User)


def _user(db, n=1):
    u = User(email=f"u{n}@x.com", username=f"u{n}", password_hash="x", full_name="U")
    db.add(u); db.flush(); return u


def test_actor_to_song_chain(db):
    actor = Actor(name="Actor A"); movie = Movie(title="Movie M", release_year=2020)
    db.add_all([actor, movie]); db.flush()
    db.add(MovieActor(movie_id=movie.id, actor_id=actor.id, billing_order=1))
    album = Album(title="M Soundtrack", movie_id=movie.id); db.add(album); db.flush()
    db.add(Song(title="Track 1", album_id=album.id, track_number=1, is_published=True)); db.commit()

    rows = db.execute(
        select(Song.title)
        .join(Album, Album.id == Song.album_id)
        .join(MovieActor, MovieActor.movie_id == Album.movie_id)
        .where(MovieActor.actor_id == actor.id)
    ).scalars().all()
    assert rows == ["Track 1"]


def test_unique_email(db):
    _user(db, 1)
    db.add(User(email="u1@x.com", username="other", password_hash="x", full_name="U"))
    with pytest.raises(IntegrityError):
        db.flush()


def test_favorite_unique_and_type_check(db):
    u = _user(db)
    db.add(Favorite(user_id=u.id, entity_type="song", entity_id=1)); db.flush()
    db.add(Favorite(user_id=u.id, entity_type="song", entity_id=1))
    with pytest.raises(IntegrityError):
        db.flush()
    db.rollback()


def test_playlist_position_unique(db):
    u = _user(db)
    p = Playlist(owner_user_id=u.id, name="P"); s1 = Song(title="a"); s2 = Song(title="b")
    db.add_all([p, s1, s2]); db.flush()
    db.add(PlaylistSong(playlist_id=p.id, song_id=s1.id, position=0)); db.flush()
    db.add(PlaylistSong(playlist_id=p.id, song_id=s2.id, position=0))
    with pytest.raises(IntegrityError):
        db.flush()
