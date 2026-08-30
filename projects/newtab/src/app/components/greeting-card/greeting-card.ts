import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '@shared/services/settings.service';
import { TypewriterDirective } from '@shared/directives/typewriter.directive';
import { CursorComponent } from '@shared/ui/cursor.component';

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

@Component({
  selector: 'app-greeting-card',
  imports: [FormsModule, TypewriterDirective, CursorComponent],
  templateUrl: './greeting-card.html',
  styleUrl: './greeting-card.scss',
})
export class GreetingCard {
  private readonly settings = inject(SettingsService);

  protected readonly timeOfDay = timeOfDayGreeting();
  protected readonly editing = signal(false);
  protected readonly draft = signal('');
  protected readonly greeting = computed(() => this.settings.settings().greeting);
  protected readonly displayText = computed(() => this.greeting() || 'Add a name or mantra');

  startEditing(): void {
    this.draft.set(this.greeting() ?? '');
    this.editing.set(true);
  }

  async save(): Promise<void> {
    const value = this.draft().trim();
    await this.settings.save({ greeting: value || null });
    this.editing.set(false);
  }
}
