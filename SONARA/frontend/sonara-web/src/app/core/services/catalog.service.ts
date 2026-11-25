import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ActorSummary,
  AlbumSummary,
  ArtistSummary,
  HomeFeed,
  MovieSummary,
  Track,
} from '../../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getHomeFeed(): Observable<HomeFeed> {
    return this.http.get<HomeFeed>(`${this.base}/home`);
  }

  getArtists(featuredOnly = false): Observable<ArtistSummary[]> {
    return this.http.get<ArtistSummary[]>(
      `${this.base}/artists${featuredOnly ? '?featured_only=true' : ''}`,
    );
  }

  getArtist(id: number): Observable<ArtistSummary & { songs: Track[]; albums: AlbumSummary[] }> {
    return this.http.get<ArtistSummary & { songs: Track[]; albums: AlbumSummary[] }>(
      `${this.base}/artists/${id}`,
    );
  }

  getActors(featuredOnly = false): Observable<ActorSummary[]> {
    return this.http.get<ActorSummary[]>(
      `${this.base}/actors${featuredOnly ? '?featured_only=true' : ''}`,
    );
  }

  getActor(id: number): Observable<ActorSummary & { movies: MovieSummary[] }> {
    return this.http.get<ActorSummary & { movies: MovieSummary[] }>(
      `${this.base}/actors/${id}`,
    );
  }

  getMovies(): Observable<MovieSummary[]> {
    return this.http.get<MovieSummary[]>(`${this.base}/movies`);
  }

  getMovie(id: number): Observable<MovieSummary & { cast: { actor_id: number; actor_name: string; character: string }[]; soundtrack: { album_id: number; title: string; songs: Track[] } }> {
    return this.http.get<MovieSummary & { cast: { actor_id: number; actor_name: string; character: string }[]; soundtrack: { album_id: number; title: string; songs: Track[] } }>(
      `${this.base}/movies/${id}`,
    );
  }

  getAlbums(): Observable<AlbumSummary[]> {
    return this.http.get<AlbumSummary[]>(`${this.base}/albums`);
  }

  getAlbum(id: number): Observable<AlbumSummary & { songs: Track[] }> {
    return this.http.get<AlbumSummary & { songs: Track[] }>(
      `${this.base}/albums/${id}`,
    );
  }

  getSongs(trending = false): Observable<Track[]> {
    return this.http.get<Track[]>(
      `${this.base}/songs${trending ? '?trending=true' : ''}`,
    );
  }
}
