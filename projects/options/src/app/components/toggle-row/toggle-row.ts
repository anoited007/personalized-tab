import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-toggle-row',
  imports: [],
  templateUrl: './toggle-row.html',
  styleUrl: './toggle-row.scss',
})
export class ToggleRow {
  readonly label = input.required<string>();
  readonly description = input<string>('');
  readonly checked = model.required<boolean>();

  toggle(): void {
    this.checked.set(!this.checked());
  }
}
