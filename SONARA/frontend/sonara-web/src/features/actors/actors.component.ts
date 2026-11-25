import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../app/core/services/catalog.service';
import { ActorSummary } from '../../app/models/catalog.model';

@Component({
  selector: 'sonara-actors',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <div class="page-header">
        <span class="badge">DISCOVERY</span>
        <h1>Star Actors & Soundtracks</h1>
        <p class="subtitle">
          Select an actor to explore their iconic filmography, directors, and complete movie soundtracks.
        </p>
      </div>

      <div class="actors-grid">
        @for (actor of actors(); track actor.id) {
          <a [routerLink]="['/actors', actor.id]" class="actor-card">
            <div class="avatar-ring">
              @if (actor.image_url) {
                <img [src]="actor.image_url" alt="" class="avatar-img" />
              } @else {
                <div class="avatar">{{ actor.name.charAt(0) }}</div>
              }
            </div>
            <span class="actor-name">{{ actor.name }}</span>
            <span class="actor-role">Film Star</span>
            <p class="actor-bio">{{ actor.bio }}</p>
            <span class="view-link">View Filmography ➔</span>
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
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.15);
        padding: 4px 10px;
        border-radius: 12px;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.6);
        font-size: 15px;
        max-width: 600px;
        margin: 0;
      }
      .actors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 24px;
      }
      .actor-card {
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
      .actor-card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: #f59e0b;
        transform: translateY(-4px);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
      }
      .avatar-ring {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        padding: 4px;
        background: linear-gradient(135deg, #f59e0b, #ec4899);
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
      .actor-name {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
      }
      .actor-role {
        font-size: 12px;
        color: #f59e0b;
        margin: 4px 0 12px;
      }
      .actor-bio {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0 0 16px;
      }
      .view-link {
        font-size: 13px;
        font-weight: 600;
        color: var(--sn-cyan);
      }
    `,
  ],
})
export class ActorsComponent implements OnInit {
  private catalog = inject(CatalogService);
  actors = signal<ActorSummary[]>([]);

  ngOnInit(): void {
    this.catalog.getActors().subscribe((list) => this.actors.set(list));
  }
}
