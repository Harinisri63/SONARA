"""SQLAlchemy models for the full SONARA schema (see docs: Phase 1, section 4)."""
from datetime import datetime

from sqlalchemy import (BigInteger, CheckConstraint, DateTime, ForeignKey, Index, Integer,
                        String, Text, UniqueConstraint, func)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, BigIntPK, SoftDeleteMixin, TimestampMixin


def pk() -> Mapped[int]:
    return mapped_column(BigIntPK, primary_key=True, autoincrement=True)


def fk(target: str, nullable: bool = False, use_alter: bool = False, **kw):
    """Foreign key column. use_alter breaks circular FK dependencies (users <-> media_assets)."""
    name = f"fk_{target.replace('.', '_')}_alt" if use_alter else None
    return mapped_column(BigInteger().with_variant(Integer, "sqlite"),
                         ForeignKey(target, use_alter=use_alter, name=name), nullable=nullable, **kw)


# ---------- Media ----------
class MediaAsset(Base, TimestampMixin):
    __tablename__ = "media_assets"
    id: Mapped[int] = pk()
    storage_key: Mapped[str] = mapped_column(String(500), unique=True)
    kind: Mapped[str] = mapped_column(String(20))  # audio | image
    mime_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(BigInteger)
    checksum: Mapped[str | None] = mapped_column(String(64))
    duration_seconds: Mapped[int | None]
    uploaded_by: Mapped[int | None] = fk("user.id", nullable=True, use_alter=True)
    __table_args__ = (CheckConstraint("kind IN ('audio','image')", name="ck_media_kind"),)


# ---------- Identity ----------
class Role(Base):
    __tablename__ = "role"
    id: Mapped[int] = pk()
    name: Mapped[str] = mapped_column(String(50), unique=True)


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "user"
    id: Mapped[int] = pk()
    email: Mapped[str] = mapped_column(String(255), unique=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(150))
    profile_image_asset_id: Mapped[int | None] = fk("media_assets.id", nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    email_verified: Mapped[bool] = mapped_column(default=False)
    roles: Mapped[list["Role"]] = relationship(secondary="user_role", lazy="selectin")


class UserRole(Base):
    __tablename__ = "user_role"
    user_id: Mapped[int] = fk("user.id", primary_key=True)
    role_id: Mapped[int] = fk("role.id", primary_key=True)


class RefreshToken(Base, TimestampMixin):
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = pk()
    user_id: Mapped[int] = fk("user.id")
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    family_id: Mapped[str] = mapped_column(String(36), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime)
    replaced_by_id: Mapped[int | None] = fk("refresh_tokens.id", nullable=True)
    client_type: Mapped[str] = mapped_column(String(10), default="web")


class PasswordResetToken(Base, TimestampMixin):
    __tablename__ = "password_reset_tokens"
    id: Mapped[int] = pk()
    user_id: Mapped[int] = fk("user.id")
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used_at: Mapped[datetime | None] = mapped_column(DateTime)


# ---------- Catalogue ----------
class Language(Base):
    __tablename__ = "languages"
    id: Mapped[int] = pk()
    code: Mapped[str] = mapped_column(String(10), unique=True)
    name: Mapped[str] = mapped_column(String(50))


class Genre(Base):
    __tablename__ = "genres"
    id: Mapped[int] = pk()
    name: Mapped[str] = mapped_column(String(80), unique=True)


class ArtistCategory(Base):
    __tablename__ = "artist_categories"
    id: Mapped[int] = pk()
    name: Mapped[str] = mapped_column(String(80), unique=True)


class Artist(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "artists"
    id: Mapped[int] = pk()
    name: Mapped[str] = mapped_column(String(200), index=True)
    bio: Mapped[str | None] = mapped_column(Text)
    country: Mapped[str | None] = mapped_column(String(80))
    image_asset_id: Mapped[int | None] = fk("media_assets.id", nullable=True)
    is_featured: Mapped[bool] = mapped_column(default=False)
    categories: Mapped[list["ArtistCategory"]] = relationship(secondary="artist_category_map")


class ArtistCategoryMap(Base):
    __tablename__ = "artist_category_map"
    artist_id: Mapped[int] = fk("artists.id", primary_key=True)
    category_id: Mapped[int] = fk("artist_categories.id", primary_key=True)


class ArtistRelation(Base):
    __tablename__ = "artist_relations"
    artist_id: Mapped[int] = fk("artists.id", primary_key=True)
    related_artist_id: Mapped[int] = fk("artists.id", primary_key=True)
    __table_args__ = (CheckConstraint("artist_id <> related_artist_id", name="ck_artist_not_self"),)


class Actor(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "actors"
    id: Mapped[int] = pk()
    name: Mapped[str] = mapped_column(String(200), index=True)
    bio: Mapped[str | None] = mapped_column(Text)
    image_asset_id: Mapped[int | None] = fk("media_assets.id", nullable=True)
    is_featured: Mapped[bool] = mapped_column(default=False)


class Movie(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "movies"
    id: Mapped[int] = pk()
    title: Mapped[str] = mapped_column(String(250), index=True)
    release_year: Mapped[int | None]
    director: Mapped[str | None] = mapped_column(String(200))
    poster_asset_id: Mapped[int | None] = fk("media_assets.id", nullable=True)
    language_id: Mapped[int | None] = fk("languages.id", nullable=True)
    music_composer_artist_id: Mapped[int | None] = fk("artists.id", nullable=True)


class MovieActor(Base):
    __tablename__ = "movie_actors"
    movie_id: Mapped[int] = fk("movies.id", primary_key=True)
    actor_id: Mapped[int] = fk("actors.id", primary_key=True)
    character_name: Mapped[str | None] = mapped_column(String(200))
    billing_order: Mapped[int] = mapped_column(Integer, default=0)
    __table_args__ = (Index("ix_movie_actors_actor", "actor_id"),)


class Album(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "albums"
    id: Mapped[int] = pk()
    title: Mapped[str] = mapped_column(String(250), index=True)
    release_year: Mapped[int | None]
    cover_asset_id: Mapped[int | None] = fk("media_assets.id", nullable=True)
    movie_id: Mapped[int | None] = fk("movies.id", nullable=True, index=True)  # soundtrack link
    album_type: Mapped[str] = mapped_column(String(20), default="album")


class AlbumArtist(Base):
    __tablename__ = "album_artists"
    album_id: Mapped[int] = fk("albums.id", primary_key=True)
    artist_id: Mapped[int] = fk("artists.id", primary_key=True)


class Song(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "songs"
    id: Mapped[int] = pk()
    title: Mapped[str] = mapped_column(String(250), index=True)
    album_id: Mapped[int | None] = fk("albums.id", nullable=True)
    track_number: Mapped[int | None]
    duration_seconds: Mapped[int | None]
    language_id: Mapped[int | None] = fk("languages.id", nullable=True)
    audio_asset_id: Mapped[int | None] = fk("media_assets.id", nullable=True)
    play_count: Mapped[int] = mapped_column(BigInteger, default=0)
    mood: Mapped[str | None] = mapped_column(String(40))
    is_published: Mapped[bool] = mapped_column(default=False)
    album: Mapped["Album | None"] = relationship("Album", foreign_keys=[album_id])
    __table_args__ = (Index("ix_songs_album_track", "album_id", "track_number"),)


class SongArtist(Base):
    __tablename__ = "song_artists"
    song_id: Mapped[int] = fk("songs.id", primary_key=True)
    artist_id: Mapped[int] = fk("artists.id", primary_key=True)
    role: Mapped[str] = mapped_column(String(30), primary_key=True, default="singer")
    __table_args__ = (Index("ix_song_artists_artist", "artist_id"),)


class SongGenre(Base):
    __tablename__ = "song_genres"
    song_id: Mapped[int] = fk("songs.id", primary_key=True)
    genre_id: Mapped[int] = fk("genres.id", primary_key=True)


class Lyrics(Base, TimestampMixin):
    __tablename__ = "lyrics"
    id: Mapped[int] = pk()
    song_id: Mapped[int] = fk("songs.id", index=True)
    language_id: Mapped[int | None] = fk("languages.id", nullable=True)
    plain_text: Mapped[str | None] = mapped_column(Text)
    timed_json: Mapped[str | None] = mapped_column(Text)  # [{"t":12.4,"line":"..."}]


# ---------- User content ----------
class Playlist(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "playlists"
    id: Mapped[int] = pk()
    owner_user_id: Mapped[int] = fk("user.id", index=True)
    name: Mapped[str] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(String(500))
    is_public: Mapped[bool] = mapped_column(default=False)
    cover_asset_id: Mapped[int | None] = fk("media_assets.id", nullable=True)
    share_token: Mapped[str | None] = mapped_column(String(64), unique=True)


class PlaylistSong(Base):
    __tablename__ = "playlist_songs"
    playlist_id: Mapped[int] = fk("playlists.id", primary_key=True)
    song_id: Mapped[int] = fk("songs.id", primary_key=True)
    position: Mapped[int] = mapped_column(Integer)
    added_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    __table_args__ = (UniqueConstraint("playlist_id", "position", name="uq_playlist_position"),)


ENTITY_TYPES = "('song','album','artist','playlist')"


class Favorite(Base, TimestampMixin):
    __tablename__ = "favourite_songs"
    id: Mapped[int] = pk()
    user_id: Mapped[int] = fk("user.id")
    entity_type: Mapped[str] = mapped_column(String(20))
    entity_id: Mapped[int] = mapped_column(BigInteger)
    __table_args__ = (
        UniqueConstraint("user_id", "entity_type", "entity_id", name="uq_favorite"),
        CheckConstraint(f"entity_type IN {ENTITY_TYPES}", name="ck_favorite_type"),
    )


class LibraryItem(Base, TimestampMixin):
    __tablename__ = "library_items"
    id: Mapped[int] = pk()
    user_id: Mapped[int] = fk("user.id")
    entity_type: Mapped[str] = mapped_column(String(20))
    entity_id: Mapped[int] = mapped_column(BigInteger)
    __table_args__ = (UniqueConstraint("user_id", "entity_type", "entity_id", name="uq_library_item"),)


class ListeningHistory(Base):
    __tablename__ = "listening_history"
    id: Mapped[int] = pk()
    user_id: Mapped[int] = fk("user.id")
    song_id: Mapped[int] = fk("songs.id")
    played_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    listened_seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed: Mapped[bool] = mapped_column(default=False)
    __table_args__ = (Index("ix_history_user_played", "user_id", "played_at"),)


class SearchHistory(Base):
    __tablename__ = "search_history"
    id: Mapped[int] = pk()
    user_id: Mapped[int] = fk("user.id")
    query: Mapped[str] = mapped_column(String(200))
    searched_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class FeaturedContent(Base, TimestampMixin):
    __tablename__ = "featured_content"
    id: Mapped[int] = pk()
    entity_type: Mapped[str] = mapped_column(String(20))
    entity_id: Mapped[int] = mapped_column(BigInteger)
    section: Mapped[str] = mapped_column(String(40))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class AuditLog(Base):
    __tablename__ = "audit_log"
    id: Mapped[int] = pk()
    actor_user_id: Mapped[int | None] = fk("user.id", nullable=True)
    action: Mapped[str] = mapped_column(String(80))
    entity_type: Mapped[str | None] = mapped_column(String(40))
    entity_id: Mapped[int | None] = mapped_column(BigInteger)
    at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
