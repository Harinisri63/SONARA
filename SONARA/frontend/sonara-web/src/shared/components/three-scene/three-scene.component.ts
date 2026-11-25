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

@Component({
  selector: 'sonara-three-scene',
  standalone: true,
  template: `
    <canvas #canvas class="three-canvas" aria-hidden="true"></canvas>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .three-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class ThreeSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private ngZone = inject(NgZone);

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private animFrameId?: number;

  private sphereMesh?: THREE.Mesh;
  private innerCoreMesh?: THREE.Mesh;
  private ring1?: THREE.Mesh;
  private ring2?: THREE.Mesh;
  private particles?: THREE.Points;

  private mouseX = 0;
  private mouseY = 0;
  private targetX = 0;
  private targetY = 0;

  ngAfterViewInit(): void {
    // Run outside Angular zone to avoid triggering change detection on every RAF frame
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
    });
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Renderer
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
      // Graceful fallback if WebGL is disabled or unsupported
      return;
    }

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // Lights
    const ambient = new THREE.AmbientLight(0x0f172a, 1.5);
    this.scene.add(ambient);

    const violetLight = new THREE.PointLight(0x8b5cf6, 6, 25);
    violetLight.position.set(4, 3, 4);
    this.scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 5, 25);
    cyanLight.position.set(-4, -3, 3);
    this.scene.add(cyanLight);

    // 1. Futuristic Wireframe Music Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(1.8, 4);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x2e1065,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
    });
    this.sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    this.scene.add(this.sphereMesh);

    // 2. Translucent Inner Core
    const coreGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.18,
    });
    this.innerCoreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(this.innerCoreMesh);

    // 3. Orbiting Soundwave Rings
    const ring1Geo = new THREE.TorusGeometry(2.6, 0.025, 16, 120);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.6,
    });
    this.ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    this.ring1.rotation.x = Math.PI / 3;
    this.scene.add(this.ring1);

    const ring2Geo = new THREE.TorusGeometry(3.1, 0.02, 16, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.45,
    });
    this.ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.ring2.rotation.y = Math.PI / 4;
    this.scene.add(this.ring2);

    // 4. Moving 3D Particle Field
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);

    this.animate();
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;

    // Gentle floating and rotation
    if (this.sphereMesh) {
      this.sphereMesh.rotation.x = time * 0.2;
      this.sphereMesh.rotation.y = time * 0.25;
      const pulse = 1 + Math.sin(time * 2) * 0.04;
      this.sphereMesh.scale.set(pulse, pulse, pulse);
    }

    if (this.innerCoreMesh) {
      this.innerCoreMesh.rotation.y = -time * 0.15;
    }

    if (this.ring1) {
      this.ring1.rotation.z = time * 0.3;
    }

    if (this.ring2) {
      this.ring2.rotation.x = time * 0.25;
      this.ring2.rotation.y = time * 0.2;
    }

    if (this.particles) {
      this.particles.rotation.y = time * 0.05;
      this.particles.rotation.x = time * 0.02;
    }

    // Smooth camera parallax
    this.targetX = this.mouseX * 0.0006;
    this.targetY = this.mouseY * 0.0006;
    if (this.camera) {
      this.camera.position.x += (this.targetX - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.targetY - this.camera.position.y) * 0.05;
      this.camera.lookAt(0, 0, 0);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    this.mouseX = e.clientX - window.innerWidth / 2;
    this.mouseY = e.clientY - window.innerHeight / 2;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    // Dispose geometries and materials to prevent memory leaks
    if (this.sphereMesh) {
      this.sphereMesh.geometry.dispose();
      (this.sphereMesh.material as THREE.Material).dispose();
    }
    if (this.innerCoreMesh) {
      this.innerCoreMesh.geometry.dispose();
      (this.innerCoreMesh.material as THREE.Material).dispose();
    }
    if (this.ring1) {
      this.ring1.geometry.dispose();
      (this.ring1.material as THREE.Material).dispose();
    }
    if (this.ring2) {
      this.ring2.geometry.dispose();
      (this.ring2.material as THREE.Material).dispose();
    }
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
