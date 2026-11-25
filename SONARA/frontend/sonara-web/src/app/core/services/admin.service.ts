import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminStats {
  total_songs: number;
  total_artists: number;
  total_actors: number;
  total_movies: number;
  total_albums: number;
  total_playlists: number;
  total_users: number;
  total_plays: number;
}

export interface CatalogSongItem {
  id: number;
  title: string;
  duration: number;
  plays: number;
  mood?: string;
  album_id?: number | null;
  artist_ids?: number[];
  genre_ids?: number[];
  audio_url?: string;
  image_url?: string;
  is_published?: boolean;
}

export interface CatalogArtistItem {
  id: number;
  name: string;
  bio?: string;
  country?: string;
  is_featured?: boolean;
  image_url?: string;
  categories?: string[];
}

export interface CatalogActorItem {
  id: number;
  name: string;
  bio?: string;
  is_featured?: boolean;
  image_url?: string;
}

export interface CatalogMovieItem {
  id: number;
  title: string;
  year?: number;
  director?: string;
  composer_artist_id?: number | null;
  poster_url?: string;
}

export interface CatalogAlbumItem {
  id: number;
  title: string;
  year?: number;
  movie_id?: number | null;
  type?: string;
  cover_url?: string;
}

export interface CatalogPlaylistItem {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
}

export interface CatalogOverview {
  songs: CatalogSongItem[];
  artists: CatalogArtistItem[];
  actors: CatalogActorItem[];
  movies: CatalogMovieItem[];
  albums: CatalogAlbumItem[];
  playlists: CatalogPlaylistItem[];
  genres: { id: number; name: string }[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/admin`;

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/stats`);
  }

  getOverview(): Observable<CatalogOverview> {
    return this.http.get<CatalogOverview>(`${this.base}/overview`);
  }

  // --- SONGS ---
  addSong(data: {
    title: string;
    album_id?: number | null;
    custom_album_title?: string;
    artist_ids: number[];
    custom_artist_names?: string;
    duration_seconds: number;
    mood?: string;
    genre_ids: number[];
    is_published: boolean;
    audio_url?: string;
    image_url?: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/songs`, data);
  }

  updateSong(songId: number, data: {
    title?: string;
    album_id?: number | null;
    custom_album_title?: string;
    artist_ids?: number[];
    custom_artist_names?: string;
    duration_seconds?: number;
    mood?: string;
    genre_ids?: number[];
    is_published?: boolean;
    audio_url?: string;
    image_url?: string;
  }): Observable<any> {
    return this.http.put(`${this.base}/songs/${songId}`, data);
  }

  deleteSong(songId: number): Observable<any> {
    return this.http.delete(`${this.base}/songs/${songId}`);
  }

  // --- ARTISTS ---
  addArtist(data: {
    name: string;
    bio?: string;
    country?: string;
    is_featured: boolean;
    categories: string[];
    image_url?: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/artists`, data);
  }

  updateArtist(artistId: number, data: {
    name?: string;
    bio?: string;
    country?: string;
    is_featured?: boolean;
    categories?: string[];
    image_url?: string;
  }): Observable<any> {
    return this.http.put(`${this.base}/artists/${artistId}`, data);
  }

  deleteArtist(artistId: number): Observable<any> {
    return this.http.delete(`${this.base}/artists/${artistId}`);
  }

  // --- ACTORS ---
  addActor(data: {
    name: string;
    bio?: string;
    is_featured: boolean;
    image_url?: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/actors`, data);
  }

  updateActor(actorId: number, data: {
    name?: string;
    bio?: string;
    is_featured?: boolean;
    image_url?: string;
  }): Observable<any> {
    return this.http.put(`${this.base}/actors/${actorId}`, data);
  }

  deleteActor(actorId: number): Observable<any> {
    return this.http.delete(`${this.base}/actors/${actorId}`);
  }

  // --- MOVIES ---
  addMovie(data: {
    title: string;
    release_year: number;
    director?: string;
    composer_artist_id?: number | null;
    cast: { actor_id: number; character_name?: string }[];
    poster_url?: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/movies`, data);
  }

  updateMovie(movieId: number, data: {
    title?: string;
    release_year?: number;
    director?: string;
    composer_artist_id?: number | null;
    cast?: { actor_id: number; character_name?: string }[];
    poster_url?: string;
  }): Observable<any> {
    return this.http.put(`${this.base}/movies/${movieId}`, data);
  }

  deleteMovie(movieId: number): Observable<any> {
    return this.http.delete(`${this.base}/movies/${movieId}`);
  }

  // --- ALBUMS ---
  addAlbum(data: {
    title: string;
    release_year: number;
    movie_id?: number | null;
    primary_artist_id?: number | null;
    album_type: string;
    cover_url?: string;
  }): Observable<any> {
    return this.http.post(`${this.base}/albums`, data);
  }

  updateAlbum(albumId: number, data: {
    title?: string;
    release_year?: number;
    movie_id?: number | null;
    primary_artist_id?: number | null;
    album_type?: string;
    cover_url?: string;
  }): Observable<any> {
    return this.http.put(`${this.base}/albums/${albumId}`, data);
  }

  deleteAlbum(albumId: number): Observable<any> {
    return this.http.delete(`${this.base}/albums/${albumId}`);
  }

  // --- PLAYLISTS ---
  createCuratedPlaylist(data: {
    name: string;
    description?: string;
    song_ids: number[];
    is_public: boolean;
  }): Observable<any> {
    return this.http.post(`${this.base}/playlists`, data);
  }

  updateCuratedPlaylist(playlistId: number, data: {
    name?: string;
    description?: string;
    song_ids?: number[];
    is_public?: boolean;
  }): Observable<any> {
    return this.http.put(`${this.base}/playlists/${playlistId}`, data);
  }

  deletePlaylist(playlistId: number): Observable<any> {
    return this.http.delete(`${this.base}/playlists/${playlistId}`);
  }
}
