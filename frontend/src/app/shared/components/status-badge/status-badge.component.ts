import { Component, HostBinding, Input } from '@angular/core';
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
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
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
