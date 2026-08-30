import { Directive, ElementRef, OnDestroy, effect, inject, input } from '@angular/core';
import { RipplesEngine, ripplesSupported } from '../ripples/ripples-engine';

// At intensity 1.0 this is close to the old fixed defaults; the default
// intensity (see Settings.rippleIntensity) sits well below that.
const MAX_PERTURBANCE = 0.03;
const MAX_MOVE_STRENGTH = 0.012;
const MAX_BIG_STRENGTH = 0.16;

/**
 * Water-ripple distortion on the host element's background image — move or
 * click over it and the image ripples like water. WebGL-based; silently
 * does nothing if the browser can't run it (no exception, just a static
 * background), the viewer asked for reduced motion, or `enabled` is false.
 */
@Directive({
  selector: '[appRipples]',
})
export class RipplesDirective implements OnDestroy {
  readonly appRipples = input.required<string>(); // image URL
  readonly enabled = input(true);
  /** 0 (barely there) to 1 (strong). */
  readonly intensity = input(0.35);

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  private engine?: RipplesEngine;
  private resizeObserver?: ResizeObserver;
  private readonly visibilityHandler = () => (document.hidden ? this.engine?.pause() : this.engine?.play());

  constructor() {
    effect(() => {
      if (this.enabled() && !this.reducedMotion) {
        this.start();
      } else {
        this.stop();
      }
    });

    effect(() => {
      this.engine?.setPerturbance(MAX_PERTURBANCE * this.intensity());
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private start(): void {
    if (this.engine || !ripplesSupported()) return;

    try {
      this.engine = new RipplesEngine(this.host, this.appRipples(), {
        resolution: 256,
        dropRadius: 24,
        perturbance: MAX_PERTURBANCE * this.intensity(),
      });
    } catch {
      return; // WebGL context creation can still fail despite the capability check
    }

    this.host.style.position ||= 'relative';
    this.host.addEventListener('mousemove', this.onMouseMove);
    this.host.addEventListener('mousedown', this.onMouseDown);
    this.host.addEventListener('touchmove', this.onTouch);
    this.host.addEventListener('touchstart', this.onTouch);
    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Covers both window resizes and the host's own size settling after the
    // very first layout pass (it can be 0x0 at construction time).
    this.resizeObserver = new ResizeObserver(() => this.engine?.updateSize());
    this.resizeObserver.observe(this.host);
  }

  private stop(): void {
    if (!this.engine) return;
    this.host.removeEventListener('mousemove', this.onMouseMove);
    this.host.removeEventListener('mousedown', this.onMouseDown);
    this.host.removeEventListener('touchmove', this.onTouch);
    this.host.removeEventListener('touchstart', this.onTouch);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.engine.destroy();
    this.engine = undefined;
  }

  private readonly onMouseMove = (e: MouseEvent) => this.dropAt(e.clientX, e.clientY, false);
  private readonly onMouseDown = (e: MouseEvent) => this.dropAt(e.clientX, e.clientY, true);
  private readonly onTouch = (e: TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) this.dropAt(touch.clientX, touch.clientY, false);
  };

  private dropAt(clientX: number, clientY: number, big: boolean): void {
    if (!this.engine) return;
    const rect = this.host.getBoundingClientRect();
    const radius = big ? 36 : 24;
    const strength = (big ? MAX_BIG_STRENGTH : MAX_MOVE_STRENGTH) * this.intensity();
    this.engine.drop(clientX - rect.left, clientY - rect.top, radius, strength);
  }
}
