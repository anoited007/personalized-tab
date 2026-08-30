import { Component, input } from '@angular/core';
import { Quote } from '@shared/models/models';
import { TypewriterDirective } from '@shared/directives/typewriter.directive';

@Component({
  selector: 'app-quote-card',
  imports: [TypewriterDirective],
  templateUrl: './quote-card.html',
  styleUrl: './quote-card.scss',
})
export class QuoteCard {
  readonly label = input.required<string>();
  readonly quote = input<Quote | null>(null);
  readonly delay = input(0);
}
