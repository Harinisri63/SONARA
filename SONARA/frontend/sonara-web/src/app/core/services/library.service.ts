import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Track } from '../../models/catalog.model';

export interface PlaylistSummary {
  id: number;
  name: string;
  description?: string;
  is_public: boolean;
  song_count: number;
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  readonly favorites = signal<Set<number>>(new Set());
  readonly playlists = signal<PlaylistSummary[]>([]);

  loadFavorites(): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/me/favorites/ids`).pipe(
      tap((ids) => {
        this.favorites.set(new Set(ids));
      }),
      catchError((err) => {
        console.warn('Failed to load favorites ids', err);
        return of([]);
      })
    );
  }

  toggleFavorite(songId: number): Observable<{ favorited: boolean }> {
    return this.http.post<{ favorited: boolean }>(`${this.base}/me/favorites/${songId}`, {}).pipe(
      tap((res) => {
        const favs = new Set(this.favorites());
        if (res.favorited) {
          favs.add(songId);
        } else {
          favs.delete(songId);
        }
        this.favorites.set(favs);
      }),
    );
  }

  isFavorite(songId: number): boolean {
    return this.favorites().has(songId);
  }

  getFavorites(): Observable<Track[]> {
    return this.http.get<Track[]>(`${this.base}/me/favorites`).pipe(
      tap((tracks) => {
        const ids = new Set(tracks.map((t) => t.id));
        this.favorites.set(ids);
      }),
    );
  }

  getPlaylists(): Observable<PlaylistSummary[]> {
    return this.http.get<PlaylistSummary[]>(`${this.base}/me/playlists`).pipe(
      tap((lists) => this.playlists.set(lists)),
    );
  }

  createPlaylist(name: string, description?: string): Observable<PlaylistSummary> {
    return this.http.post<PlaylistSummary>(`${this.base}/me/playlists`, { name, description }).pipe(
      tap((p) => this.playlists.set([p, ...this.playlists()])),
    );
  }

  addSongToPlaylist(playlistId: number, songId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.base}/me/playlists/${playlistId}/songs`, { song_id: songId });
  }

  search(query: string): Observable<{ songs: Track[]; artists: any[]; movies: any[]; albums: any[] }> {
    return this.http.get<{ songs: Track[]; artists: any[]; movies: any[]; albums: any[] }>(
      `${this.base}/search?q=${encodeURIComponent(query)}`,
    );
  }
}
