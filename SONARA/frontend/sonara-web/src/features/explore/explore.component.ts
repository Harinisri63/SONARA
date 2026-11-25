import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LibraryService } from '../../app/core/services/library.service';
import { PlayerService } from '../../app/core/services/player.service';
import { CatalogService } from '../../app/core/services/catalog.service';
import { Track } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-explore',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="explore-page">
      <header class="explore-header">
        <h1>Explore & Discover</h1>
        <div class="search-bar">
          <span class="icon">⌕</span>
          <input
            type="text"
            placeholder="Search all songs, artists, actors, soundtracks..."
            [(ngModel)]="query"
            (ngModelChange)="onQueryChange()"
          />
        </div>
      </header>

      <!-- Genre & Mood Filter Chips -->
      <section class="genres-section">
        <h3>Browse by Genre & Mood</h3>
        <div class="chips-container">
          @for (genre of genres; track genre) {
            <button
              class="genre-chip"
              [class.active]="selectedGenre() === genre"
              (click)="selectGenre(genre)"
            >
              {{ genre }}
            </button>
          }
        </div>
      </section>

      <!-- Dynamic Search Results -->
      @if (results(); as res) {
        <section class="results-section">
          <h2>Search Results for "{{ query }}"</h2>

          <!-- Songs -->
          @if (res.songs && res.songs.length > 0) {
            <div class="result-group">
              <h4>Songs</h4>
              <div class="songs-list">
                @for (song of res.songs; track song.id) {
                  <div class="song-row" (click)="playSong(song)">
                    <span class="play-icon">▶</span>
                    <div class="meta">
                      <span class="title">{{ song.title }}</span>
                      <span class="sub">{{ song.mood }}</span>
                    </div>
                    <span class="duration">{{ player.formatTime(song.duration_seconds) }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Artists -->
          @if (res.artists && res.artists.length > 0) {
            <div class="result-group">
              <h4>Artists</h4>
              <div class="grid-small">
                @for (art of res.artists; track art.id) {
                  <a [routerLink]="['/artists', art.id]" class="card-small">
                    <span class="art-icon">♪</span>
                    <span>{{ art.name }}</span>
                  </a>
                }
              </div>
            </div>
          }

          <!-- Movies -->
          @if (res.movies && res.movies.length > 0) {
            <div class="result-group">
              <h4>Movies</h4>
              <div class="grid-small">
                @for (mov of res.movies; track mov.id) {
                  <a [routerLink]="['/movies', mov.id]" class="card-small">
                    <span class="art-icon">🎬</span>
                    <span>{{ mov.title }}</span>
                  </a>
                }
              </div>
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: [
    `
      .explore-page {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 36px;
      }
      .explore-header h1 {
        font-size: 32px;
        color: #fff;
        margin: 0 0 16px;
      }
      .search-bar {
        position: relative;
        max-width: 600px;
      }
      .search-bar .icon {
        position: absolute;
        left: 18px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: rgba(255, 255, 255, 0.4);
      }
      .search-bar input {
        width: 100%;
        padding: 14px 20px 14px 48px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        font-size: 15px;
        box-sizing: border-box;
      }
      .search-bar input:focus {
        outline: none;
        border-color: var(--sn-cyan);
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
      }
      .genres-section h3 {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        margin: 0 0 14px;
      }
      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .genre-chip {
        padding: 8px 18px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.8);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .genre-chip:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--sn-cyan);
        color: #fff;
      }
      .genre-chip.active {
        background: linear-gradient(135deg, var(--sn-violet), var(--sn-cyan));
        color: #fff;
        border-color: transparent;
      }
      .results-section h2 {
        font-size: 22px;
        color: #fff;
        margin: 0 0 20px;
      }
      .result-group {
        margin-bottom: 24px;
      }
      .result-group h4 {
        font-size: 15px;
        color: var(--sn-cyan);
        margin: 0 0 12px;
      }
      .songs-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .song-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 18px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;
        transition: all 0.2s;
      }
      .song-row:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .play-icon {
        color: var(--sn-cyan);
        font-size: 14px;
      }
      .meta {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .meta .title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
      .meta .sub {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
      .duration {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
      .grid-small {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }
      .card-small {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #fff;
        text-decoration: none;
        font-size: 13px;
        transition: all 0.2s;
      }
      .card-small:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--sn-cyan);
      }
      .art-icon {
        color: var(--sn-cyan);
      }
    `,
  ],
})
export class ExploreComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private library = inject(LibraryService);
  private catalog = inject(CatalogService);
  player = inject(PlayerService);

  query = '';
  selectedGenre = signal<string | null>(null);
  results = signal<{ songs: Track[]; artists: any[]; movies: any[]; albums: any[] } | null>(null);

  genres = [
    'Melody', 'Romantic', 'Classical', 'Rock', 'Pop',
    'Hip-hop', 'Electronic', 'Instrumental', 'Lo-fi'
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['q']) {
        this.query = params['q'];
        this.search();
      }
    });
  }

  onQueryChange(): void {
    if (this.query.trim().length >= 2) {
      this.search();
    } else {
      this.results.set(null);
    }
  }

  selectGenre(genre: string): void {
    if (this.selectedGenre() === genre) {
      this.selectedGenre.set(null);
    } else {
      this.selectedGenre.set(genre);
      this.query = genre;
      this.search();
    }
  }

  search(): void {
    this.library.search(this.query).subscribe((data) => this.results.set(data));
  }

  playSong(song: Track): void {
    this.player.playTrack(song);
  }
}
