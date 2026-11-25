import { Injectable, computed, signal } from '@angular/core';
import { Track } from '../../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private audio = new Audio();
  private audioCtx?: AudioContext;
  private analyser?: AnalyserNode;
  private sourceNode?: MediaElementAudioSourceNode;
  private freqData?: Uint8Array;

  readonly currentTrack = signal<Track | null>(null);
  readonly isPlaying = signal<boolean>(false);
  readonly currentTime = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly volume = signal<number>(0.8);
  readonly isMuted = signal<boolean>(false);
  readonly isShuffle = signal<boolean>(false);
  readonly isRepeat = signal<boolean>(false);
  readonly queue = signal<Track[]>([]);
  readonly currentIndex = signal<number>(-1);
  readonly isFullScreenVisualizer = signal<boolean>(false);

  readonly hasTrack = computed(() => this.currentTrack() !== null);
  readonly progressPercent = computed(() => {
    const dur = this.duration();
    return dur > 0 ? (this.currentTime() / dur) * 100 : 0;
  });

  constructor() {
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';
    this.audio.volume = this.volume();

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime.set(this.audio.currentTime);
    });

    this.audio.addEventListener('durationchange', () => {
      this.duration.set(this.audio.duration || 0);
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
      this.ensureAudioContext();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('ended', () => {
      if (this.isRepeat()) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.next();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Playback error or network chunk fallback', e);
      this.isPlaying.set(false);
    });
  }

  private ensureAudioContext(): void {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        } catch {
          // If already connected or cross-origin restricted
        }
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  getFrequencyData(): Uint8Array {
    if (this.analyser && this.freqData) {
      this.analyser.getByteFrequencyData(this.freqData);
      return this.freqData;
    }
    return new Uint8Array(64).fill(0);
  }

  playTrack(track: Track, newQueue?: Track[]): void {
    if (newQueue) {
      this.queue.set(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      this.currentIndex.set(idx >= 0 ? idx : 0);
    } else {
      const q = this.queue();
      if (!q.some((t) => t.id === track.id)) {
        this.queue.set([...q, track]);
        this.currentIndex.set(this.queue().length - 1);
      } else {
        this.currentIndex.set(q.findIndex((t) => t.id === track.id));
      }
    }

    this.currentTrack.set(track);
    this.audio.src = track.stream_url;
    this.audio.volume = this.volume();
    this.audio.muted = this.isMuted();
    this.audio.load();
    this.audio.play().catch((err) => {
      console.warn('Autoplay prevented by browser:', err);
    });
  }

  togglePlay(): void {
    if (!this.currentTrack()) return;
    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      this.ensureAudioContext();
      this.audio.play();
    }
  }

  next(): void {
    const q = this.queue();
    if (q.length === 0) return;

    let nextIdx = this.currentIndex() + 1;
    if (this.isShuffle()) {
      nextIdx = Math.floor(Math.random() * q.length);
    } else if (nextIdx >= q.length) {
      nextIdx = 0;
    }

    this.currentIndex.set(nextIdx);
    this.playTrack(q[nextIdx]);
  }

  prev(): void {
    const q = this.queue();
    if (q.length === 0) return;

    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    let prevIdx = this.currentIndex() - 1;
    if (prevIdx < 0) prevIdx = q.length - 1;

    this.currentIndex.set(prevIdx);
    this.playTrack(q[prevIdx]);
  }

  seek(seconds: number): void {
    if (isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.duration()));
      this.currentTime.set(this.audio.currentTime);
    }
  }

  seekPercent(percent: number): void {
    const target = (percent / 100) * this.duration();
    this.seek(target);
  }

  setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(vol, 1));
    this.volume.set(clamped);
    this.audio.volume = clamped;
    this.isMuted.set(clamped === 0);
  }

  toggleMute(): void {
    if (this.isMuted()) {
      this.isMuted.set(false);
      this.audio.volume = this.volume() || 0.8;
    } else {
      this.isMuted.set(true);
      this.audio.volume = 0;
    }
  }

  toggleShuffle(): void {
    this.isShuffle.update((s) => !s);
  }

  toggleRepeat(): void {
    this.isRepeat.update((r) => !r);
  }

  toggleFullScreen(): void {
    this.isFullScreenVisualizer.update((v) => !v);
  }

  formatTime(secs: number): string {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
