import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { PlayerService } from '../../app/core/services/player.service';

@Component({
  selector: 'sonara-full-player-3d',
  standalone: true,
  template: `
    <div class="modal-backdrop">
      <canvas #canvas class="three-canvas"></canvas>

      <div class="overlay-ui">
        <button class="close-btn" (click)="player.toggleFullScreen()" title="Exit 3D View">
          ✕ ESC
        </button>

        <div class="track-hero">
          <div class="badge">NOW STREAMING IN 3D IMMERSION</div>
          <h1 class="song-title">{{ player.currentTrack()?.title }}</h1>
          <p class="song-artist">{{ artistNames() }}</p>
          <p class="song-album">{{ player.currentTrack()?.album_title || 'Single' }}</p>
        </div>

        <div class="bottom-controls">
          <div class="progress-container">
            <span class="time">{{ player.formatTime(player.currentTime()) }}</span>
            <div class="bar" (click)="onSeek($event)">
              <div class="fill" [style.width.%]="player.progressPercent()"></div>
            </div>
            <span class="time">{{ player.formatTime(player.duration()) }}</span>
          </div>

          <div class="control-buttons">
            <button class="ctrl-btn" (click)="player.prev()">⏮</button>
            <button class="play-btn" (click)="player.togglePlay()">
              {{ player.isPlaying() ? '⏸' : '▶' }}
            </button>
            <button class="ctrl-btn" (click)="player.next()">⏭</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 200;
        background: #06060c;
        display: flex;
        flex-direction: column;
      }
      .three-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }
      .overlay-ui {
        position: relative;
        z-index: 10;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 40px;
        box-sizing: border-box;
        pointer-events: none;
      }
      .close-btn {
        align-self: flex-end;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 10px 18px;
        border-radius: 20px;
        font-weight: 700;
        cursor: pointer;
        pointer-events: auto;
        backdrop-filter: blur(12px);
        transition: all 0.2s;
      }
      .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: var(--sn-cyan);
      }
      .track-hero {
        text-align: center;
        margin-top: auto;
        margin-bottom: 24px;
      }
      .badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 14px;
        background: rgba(139, 92, 246, 0.2);
        border: 1px solid rgba(139, 92, 246, 0.4);
        color: var(--sn-cyan);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.15em;
        margin-bottom: 12px;
      }
      .song-title {
        font-size: 44px;
        font-weight: 800;
        margin: 0;
        background: linear-gradient(90deg, #fff, var(--sn-cyan));
        -webkit-background-clip: text;
        color: transparent;
        text-shadow: 0 0 40px rgba(6, 182, 212, 0.3);
      }
      .song-artist {
        font-size: 20px;
        color: rgba(255, 255, 255, 0.7);
        margin: 8px 0 4px;
      }
      .song-album {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.4);
        margin: 0;
      }
      .bottom-controls {
        max-width: 650px;
        width: 100%;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        pointer-events: auto;
        background: rgba(10, 10, 20, 0.7);
        padding: 20px 32px;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(24px);
      }
      .progress-container {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
      }
      .time {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        font-variant-numeric: tabular-nums;
      }
      .bar {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: rgba(255, 255, 255, 0.15);
        cursor: pointer;
        position: relative;
      }
      .fill {
        height: 100%;
        border-radius: 3px;
        background: linear-gradient(90deg, var(--sn-violet), var(--sn-cyan));
        box-shadow: 0 0 12px var(--sn-cyan);
      }
      .control-buttons {
        display: flex;
        align-items: center;
        gap: 24px;
      }
      .ctrl-btn {
        background: none;
        border: 0;
        color: #fff;
        font-size: 22px;
        cursor: pointer;
        transition: transform 0.15s;
      }
      .ctrl-btn:hover {
        transform: scale(1.15);
        color: var(--sn-cyan);
      }
      .play-btn {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #fff;
        color: #000;
        border: 0;
        font-size: 20px;
        display: grid;
        place-items: center;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .play-btn:hover {
        transform: scale(1.08);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
      }
    `,
  ],
})
export class FullPlayer3DComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  player = inject(PlayerService);
  private ngZone = inject(NgZone);

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private animFrameId?: number;

  private vinylDisc?: THREE.Group;
  private frequencyBars: THREE.Mesh[] = [];

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.init3DScene();
    });
  }

  private init3DScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch {
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 1.2, 5.5);
    this.camera.lookAt(0, 0, 0);

    // Dynamic Lighting
    const ambient = new THREE.AmbientLight(0x0f172a, 2);
    this.scene.add(ambient);

    const cyanLight = new THREE.PointLight(0x06b6d4, 7, 25);
    cyanLight.position.set(-3, 2, 4);
    this.scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 8, 25);
    violetLight.position.set(3, -1, 3);
    this.scene.add(violetLight);

    // 1. Realistic 3D Vinyl Record
    this.vinylDisc = new THREE.Group();

    // Outer Vinyl Groove Disc
    const discGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.04, 64);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.35,
      metalness: 0.9,
    });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.rotation.x = Math.PI / 2.8;
    this.vinylDisc.add(discMesh);

    // Vinyl Label Center
    const labelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.045, 48);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.4,
      roughness: 0.2,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.rotation.x = Math.PI / 2.8;
    this.vinylDisc.add(labelMesh);

    // Center Spindle Hole
    const holeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
    const holeMesh = new THREE.Mesh(holeGeo, holeMat);
    holeMesh.rotation.x = Math.PI / 2.8;
    this.vinylDisc.add(holeMesh);

    this.scene.add(this.vinylDisc);

    // 2. Audio-Reactive Frequency Waveform Ring (32 Frequency Spectrum Bars)
    const barCount = 32;
    const barRadius = 2.4;
    const barGeo = new THREE.BoxGeometry(0.08, 0.6, 0.08);

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0x8b5cf6,
        transparent: true,
        opacity: 0.85,
      });
      const bar = new THREE.Mesh(barGeo, mat);
      bar.position.set(Math.cos(angle) * barRadius, Math.sin(angle) * (barRadius * 0.65), 0);
      bar.rotation.z = angle + Math.PI / 2;
      this.scene.add(bar);
      this.frequencyBars.push(bar);
    }

    this.animate();
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    // Fetch live FFT frequency data from player
    const freq = this.player.getFrequencyData();
    const isPlaying = this.player.isPlaying();

    // Rotate vinyl if playing
    if (this.vinylDisc && isPlaying) {
      this.vinylDisc.rotation.z -= 0.025;
    }

    // Audio-reactive scale on frequency bars
    for (let i = 0; i < this.frequencyBars.length; i++) {
      const bar = this.frequencyBars[i];
      const val = freq[i * 2] || 0; // Sample lower and mid frequencies
      const targetScale = isPlaying ? Math.max(0.2, (val / 255) * 2.8) : 0.2;
      bar.scale.y += (targetScale - bar.scale.y) * 0.25;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.player.toggleFullScreen();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  artistNames(): string {
    const artists = this.player.currentTrack()?.artists;
    return artists && artists.length > 0 ? artists.map((a) => a.name).join(', ') : 'Unknown Artist';
  }

  onSeek(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    this.player.seekPercent(percent);
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.frequencyBars.forEach((b) => {
      b.geometry.dispose();
      (b.material as THREE.Material).dispose();
    });
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
