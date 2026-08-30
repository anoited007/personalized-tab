import { Directive, ElementRef, OnChanges, OnDestroy, SimpleChanges, inject, input } from '@angular/core';
import { SettingsService } from '../services/settings.service';

/**
 * Types its bound text into the host element one character at a time, like a
 * terminal — used for quotes/greeting text as it arrives. Re-typing on every
 * new value (a fresh quote, an edited greeting), not just on first render.
 * Skipped entirely (text just appears) when Settings.enableTypingEffect is
 * off, or the viewer asked for reduced motion.
 */
@Directive({
  selector: '[appTypewriter]',
})
export class TypewriterDirective implements OnChanges, OnDestroy {
  readonly appTypewriter = input<string>('');
  readonly typewriterSpeed = input(16);

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly settings = inject(SettingsService);
  private timer?: ReturnType<typeof setInterval>;

  ngOnChanges(changes: SimpleChanges): void {
    if ('appTypewriter' in changes) this.type(this.appTypewriter());
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private type(text: string): void {
    clearInterval(this.timer);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !this.settings.settings().enableTypingEffect || !text) {
      this.el.textContent = text;
      return;
    }

    this.el.textContent = '';
    let i = 0;
    this.timer = setInterval(() => {
      i++;
      this.el.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(this.timer);
    }, this.typewriterSpeed());
  }
}
