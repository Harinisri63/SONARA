import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../app/core/services/catalog.service';
import { ArtistSummary } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-artists',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <span class="badge">DISCOVERY</span>
        <h1>Legendary Artists & Composers</h1>
        <p class="subtitle">
          Explore iconic music directors, playback singers, and composers shaping world cinema and sound.
        </p>
      </div>

      <div class="artists-grid">
        @for (artist of artists(); track artist.id) {
          <a [routerLink]="['/artists', artist.id]" class="artist-card">
            <div class="avatar-ring">
              @if (artist.image_url) {
                <img [src]="artist.image_url" alt="" class="avatar-img" />
              } @else {
                <div class="avatar">{{ artist.name.charAt(0) }}</div>
              }
            </div>
            <span class="name">{{ artist.name }}</span>
            <span class="role">{{ artist.country || 'International' }}</span>
            <p class="bio">{{ artist.bio }}</p>
            <span class="discog-link">Explore Discography ➔</span>
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
        color: var(--sn-cyan);
        background: rgba(6, 182, 212, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(6, 182, 212, 0.3);
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 15px;
        max-width: 600px;
        margin: 0;
      }
      .artists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 24px;
      }
      .artist-card {
        padding: 24px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        text-decoration: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        transition: all 0.25s ease;
      }
      .artist-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--sn-cyan);
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      }
      .avatar-ring {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        padding: 4px;
        background: linear-gradient(135deg, var(--sn-violet), var(--sn-cyan));
        margin-bottom: 16px;
        overflow: hidden;
      }
      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }
      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #11111a;
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 32px;
        font-weight: 800;
      }
      .name {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
      }
      .role {
        font-size: 12px;
        color: var(--sn-cyan);
        margin: 4px 0 12px;
      }
      .bio {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0 0 16px;
      }
      .discog-link {
        font-size: 13px;
        font-weight: 600;
        color: var(--sn-violet);
      }
    `,
  ],
})
export class ArtistsComponent implements OnInit {
  private catalog = inject(CatalogService);
  artists = signal<ArtistSummary[]>([]);

  ngOnInit(): void {
    this.catalog.getArtists().subscribe((list) => this.artists.set(list));
  }
}
