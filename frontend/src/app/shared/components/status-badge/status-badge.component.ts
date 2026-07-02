import { Component, Input } from '@angular/core';
import { DeliveryStatus } from '../../../core/models';
import { DELIVERY_STATUS_LABELS } from '../../utils/delivery-status.labels';

const STATUS_CLASSES: Record<DeliveryStatus, string> = {
  PENDING: 'status-pending',
  PICKED_UP: 'status-picked',
  IN_TRANSIT: 'status-transit',
  OUT_FOR_DELIVERY: 'status-out',
  DELIVERED: 'status-delivered',
  DELAYED: 'status-delayed',
  FAILED: 'status-failed',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="cssClass">{{ label }}</span>`,
  styles: `
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-pending { background: #e3f2fd; color: #1565c0; }
    .status-picked { background: #e8eaf6; color: #3949ab; }
    .status-transit { background: #fff3e0; color: #ef6c00; }
    .status-out { background: #f3e5f5; color: #7b1fa2; }
    .status-delivered { background: #e8f5e9; color: #2e7d32; }
    .status-delayed { background: #ffebee; color: #c62828; }
    .status-failed { background: #fce4ec; color: #ad1457; }
  `,
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: DeliveryStatus;

  get label(): string {
    return DELIVERY_STATUS_LABELS[this.status];
  }

  get cssClass(): string {
    return STATUS_CLASSES[this.status];
  }
}
