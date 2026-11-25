import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../app/core/services/catalog.service';
import { PlayerService } from '../../app/core/services/player.service';
import { LibraryService } from '../../app/core/services/library.service';
import { ActorSummary, MovieSummary, Track } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-actor-detail',
  standalone: true,
  template: `
    @if (actor(); as act) {
      <div class="detail-container">
        <!-- Hero Header -->
        <header class="actor-hero">
          <div class="avatar-large">
            @if (act.image_url) {
              <img [src]="act.image_url" alt="" class="avatar-img" />
            } @else {
              {{ act.name.charAt(0) }}
            }
          </div>
          <div class="hero-info">
            <span class="badge">ACTOR SPOTLIGHT</span>
            <h1 class="name">{{ act.name }}</h1>
            <p class="bio">{{ act.bio }}</p>
          </div>
        </header>

        <!-- Filmography & Soundtracks Workflow Section -->
        <section class="filmography-section">
          <h2>Filmography & Soundtrack Albums</h2>
          <p class="section-sub">
            Browse movies starring {{ act.name }}, view their soundtrack tracks, and stream them directly.
          </p>

          <div class="movies-list">
            @for (movie of act.movies; track movie.id) {
              <div class="movie-panel">
                <div class="movie-header">
                  <div class="poster-icon">🎬</div>
                  <div class="movie-meta">
                    <h3 class="movie-title">{{ movie.title }} ({{ movie.release_year }})</h3>
                    <p class="role-desc">
                      Role: <strong class="char-name">{{ movie.character_name || 'Lead' }}</strong> • Director: {{ movie.director }}
                    </p>
                  </div>
                  @if (movie.songs && movie.songs.length > 0) {
                    <button class="play-all-btn" (click)="playAllMovieSongs(movie)">
                      ▶ Play Soundtrack
                    </button>
                  }
                </div>

                <!-- Soundtrack Songs List -->
                @if (movie.songs && movie.songs.length > 0) {
                  <div class="tracklist">
                    @for (song of movie.songs; track song.id; let i = $index) {
                      <div class="track-row" (click)="playSong(song, movie.songs)">
                        <span class="index">{{ i + 1 }}</span>
                        <div class="track-title-wrap">
                          <span class="title">{{ song.title }}</span>
                          <span class="track-sub">Duration: {{ player.formatTime(song.duration_seconds) }} • {{ song.mood }}</span>
                        </div>
                        <button
                          class="fav-btn"
                          [class.active]="library.isFavorite(song.id)"
                          (click)="toggleFavorite($event, song.id)"
                        >
                          ♥
                        </button>
                        <span class="play-hint">▶</span>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="no-soundtrack">Soundtrack tracks coming soon.</p>
                }
              </div>
            }
          </div>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .detail-container {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 40px;
      }
      .actor-hero {
        display: flex;
        align-items: center;
        gap: 32px;
        padding: 36px;
        border-radius: 20px;
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(139, 92, 246, 0.2));
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .avatar-large {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, #f59e0b, #ec4899);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 48px;
        font-weight: 800;
        box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);
        overflow: hidden;
      }
      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .badge {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.1em;
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .name {
        font-size: 36px;
        color: #fff;
        margin: 8px 0;
      }
      .bio {
        color: rgba(255, 255, 255, 0.7);
        font-size: 15px;
        max-width: 650px;
        line-height: 1.5;
        margin: 0;
      }
      .filmography-section h2 {
        font-size: 24px;
        color: #fff;
        margin: 0 0 4px;
      }
      .section-sub {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        margin: 0 0 24px;
      }
      .movies-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .movie-panel {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 24px;
      }
      .movie-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }
      .poster-icon {
        width: 52px;
        height: 52px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.08);
        display: grid;
        place-items: center;
        font-size: 26px;
      }
      .movie-meta {
        flex: 1;
      }
      .movie-title {
        font-size: 18px;
        color: #fff;
        margin: 0 0 4px;
      }
      .role-desc {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
        margin: 0;
      }
      .char-name {
        color: var(--sn-cyan);
      }
      .play-all-btn {
        padding: 10px 18px;
        border-radius: 20px;
        background: #fff;
        color: #000;
        border: 0;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .play-all-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
      }
      .tracklist {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .track-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 10px 16px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        transition: all 0.2s;
      }
      .track-row:hover {
        background: rgba(255, 255, 255, 0.07);
        border-left: 3px solid var(--sn-cyan);
      }
      .index {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.4);
        width: 20px;
      }
      .track-title-wrap {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .track-title-wrap .title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .track-sub {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.45);
        margin-top: 2px;
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
      .play-hint {
        color: var(--sn-cyan);
        font-size: 14px;
      }
      .no-soundtrack {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.4);
        font-style: italic;
      }
    `,
  ],
})
export class ActorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalog = inject(CatalogService);
  player = inject(PlayerService);
  library = inject(LibraryService);

  actor = signal<(ActorSummary & { movies: MovieSummary[] }) | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.catalog.getActor(id).subscribe((data) => this.actor.set(data));
    }
  }

  playSong(song: Track, songs: Track[] | undefined): void {
    this.player.playTrack(song, songs || [song]);
  }

  playAllMovieSongs(movie: MovieSummary): void {
    if (movie.songs && movie.songs.length > 0) {
      this.player.playTrack(movie.songs[0], movie.songs);
    }
  }

  toggleFavorite(e: Event, songId: number): void {
    e.stopPropagation();
    this.library.toggleFavorite(songId).subscribe();
  }
}
