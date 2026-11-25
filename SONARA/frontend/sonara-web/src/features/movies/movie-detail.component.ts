import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../app/core/services/catalog.service';
import { PlayerService } from '../../app/core/services/player.service';
import { LibraryService } from '../../app/core/services/library.service';
import { MovieSummary, Track } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-movie-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (movie(); as m) {
      <div class="movie-detail">
        <header class="movie-hero">
          <div class="poster-icon">🎬</div>
          <div class="hero-info">
            <span class="badge">ORIGINAL MOTION PICTURE SOUNDTRACK</span>
            <h1 class="title">{{ m.title }}</h1>
            <p class="meta">Released: {{ m.release_year }} • Directed by {{ m.director }}</p>
            @if (m.soundtrack && m.soundtrack.songs.length > 0) {
              <button class="play-btn" (click)="playAll(m.soundtrack.songs)">
                ▶ Play Complete Soundtrack
              </button>
            }
          </div>
        </header>

        <!-- Star Cast -->
        <section class="section">
          <h2>Starring Cast</h2>
          <div class="cast-chips">
            @for (actor of m.cast; track actor.actor_id) {
              <a [routerLink]="['/actors', actor.actor_id]" class="cast-chip">
                <span class="actor-icon">★</span>
                <div>
                  <span class="actor-name">{{ actor.actor_name }}</span>
                  <span class="char-name">as {{ actor.character }}</span>
                </div>
              </a>
            }
          </div>
        </section>

        <!-- Soundtrack Tracklist -->
        @if (m.soundtrack; as ost) {
          <section class="section">
            <h2>Soundtrack Songs ({{ ost.songs.length }})</h2>
            <div class="tracks-list">
              @for (song of ost.songs; track song.id; let i = $index) {
                <div class="track-row" (click)="playSong(song, ost.songs)">
                  <span class="index">{{ i + 1 }}</span>
                  <div class="title-wrap">
                    <span class="track-title">{{ song.title }}</span>
                    <span class="track-sub">{{ song.mood }} • {{ song.play_count?.toLocaleString() }} streams</span>
                  </div>
                  <span class="duration">{{ player.formatTime(song.duration_seconds) }}</span>
                  <button
                    class="fav-btn"
                    [class.active]="library.isFavorite(song.id)"
                    (click)="toggleFavorite($event, song.id)"
                  >
                    ♥
                  </button>
                </div>
              }
            </div>
          </section>
        }
      </div>
    }
  `,
  styles: [
    `
      .movie-detail {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 40px;
      }
      .movie-hero {
        display: flex;
        align-items: center;
        gap: 32px;
        padding: 36px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(139, 92, 246, 0.25));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .poster-icon {
        width: 120px;
        height: 120px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.08);
        display: grid;
        place-items: center;
        font-size: 52px;
      }
      .badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #ec4899;
        background: rgba(236, 72, 153, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(236, 72, 153, 0.3);
      }
      .title {
        font-size: 38px;
        color: #fff;
        margin: 8px 0;
      }
      .meta {
        color: rgba(255, 255, 255, 0.7);
        font-size: 15px;
        margin: 0 0 20px;
      }
      .play-btn {
        padding: 12px 24px;
        border-radius: 24px;
        background: #fff;
        color: #000;
        border: 0;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .play-btn:hover {
        transform: scale(1.05);
      }
      .section h2 {
        font-size: 22px;
        color: #fff;
        margin: 0 0 16px;
      }
      .cast-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
      }
      .cast-chip {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 18px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        text-decoration: none;
        transition: all 0.2s;
      }
      .cast-chip:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #ec4899;
        transform: translateY(-2px);
      }
      .actor-icon {
        color: #f59e0b;
        font-size: 18px;
      }
      .actor-name {
        display: block;
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .char-name {
        display: block;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
      }
      .tracks-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .track-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 18px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        transition: all 0.2s;
      }
      .track-row:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .index {
        width: 20px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 13px;
      }
      .title-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .track-title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .track-sub {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
        margin-top: 2px;
      }
      .duration {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
      .fav-btn {
        background: none;
        border: 0;
        color: rgba(255, 255, 255, 0.3);
        font-size: 16px;
        cursor: pointer;
      }
      .fav-btn.active {
        color: #ef4444;
      }
    `,
  ],
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);
  player = inject(PlayerService);
  library = inject(LibraryService);

  movie = signal<(MovieSummary & { cast: { actor_id: number; actor_name: string; character: string }[]; soundtrack: { album_id: number; title: string; songs: Track[] } }) | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.catalog.getMovie(id).subscribe((data) => this.movie.set(data));
    }
  }

  playSong(song: Track, songs: Track[]): void {
    this.player.playTrack(song, songs);
  }

  playAll(songs: Track[]): void {
    if (songs.length > 0) {
      this.player.playTrack(songs[0], songs);
    }
  }

  toggleFavorite(e: Event, songId: number): void {
    e.stopPropagation();
    this.library.toggleFavorite(songId).subscribe();
  }
}
