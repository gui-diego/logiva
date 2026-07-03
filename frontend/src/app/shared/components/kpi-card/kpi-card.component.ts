import { Component, HostBinding, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
})
export class KpiCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() suffix?: string;
  @Input() hint?: string;
  @Input({ required: true }) icon!: string;
  @Input() iconBg = '#1976d2';
  @Input() accentColor = '#1976d2';

  @HostBinding('style.--accent')
  get accentCssVar(): string {
    return this.accentColor;
  }

  @HostBinding('style.--icon-bg')
  get iconBgCssVar(): string {
    return this.iconBg;
  }

  get formattedValue(): string {
    if (typeof this.value === 'number') {
      return Number.isInteger(this.value) ? String(this.value) : this.value.toFixed(1);
    }
    return this.value;
  }
}
