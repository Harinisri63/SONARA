import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../app/core/services/catalog.service';
import { MovieSummary } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-movies',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <span class="badge">CINEMATIC MUSIC</span>
        <h1>Films & Soundtracks</h1>
        <p class="subtitle">Discover blockbuster movies, their casts, and original soundtrack recordings.</p>
      </div>

      <div class="movies-grid">
        @for (movie of movies(); track movie.id) {
          <a [routerLink]="['/movies', movie.id]" class="movie-card">
            <div class="poster-box">
              @if (movie.poster_url) {
                <img [src]="movie.poster_url" alt="" class="poster-img" />
              } @else {
                <span class="film-icon">🎬</span>
              }
            </div>
            <span class="title">{{ movie.title }}</span>
            <span class="meta">{{ movie.release_year }} • Directed by {{ movie.director }}</span>
          </a>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }
      .page-header h1 {
        font-size: 32px;
        color: #fff;
        margin: 8px 0;
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
      .subtitle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 15px;
        margin: 0;
      }
      .movies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 24px;
      }
      .movie-card {
        padding: 16px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        text-decoration: none;
        transition: all 0.25s;
      }
      .movie-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: #ec4899;
        transform: translateY(-4px);
      }
      .poster-box {
        width: 100%;
        aspect-ratio: 16 / 10;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(139, 92, 246, 0.3));
        display: grid;
        place-items: center;
        font-size: 40px;
        margin-bottom: 14px;
        overflow: hidden;
      }
      .poster-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .title {
        display: block;
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .meta {
        display: block;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 4px;
      }
    `,
  ],
})
export class MoviesComponent implements OnInit {
  private catalog = inject(CatalogService);
  movies = signal<MovieSummary[]>([]);

  ngOnInit(): void {
    this.catalog.getMovies().subscribe((list) => this.movies.set(list));
  }
}
