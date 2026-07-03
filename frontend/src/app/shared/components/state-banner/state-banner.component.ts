import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type StateBannerType = 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'app-state-banner',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './state-banner.component.html',
  styleUrl: './state-banner.component.scss',
})
export class StateBannerComponent {
  @Input({ required: true }) message!: string;
  @Input() type: StateBannerType = 'info';
  @Input() icon = 'info';

  get iconName(): string {
    if (this.icon !== 'info') {
      return this.icon;
    }

    const icons: Record<StateBannerType, string> = {
      error: 'error_outline',
      warning: 'warning_amber',
      info: 'info',
      success: 'check_circle',
    };

    return icons[this.type];
  }
}
