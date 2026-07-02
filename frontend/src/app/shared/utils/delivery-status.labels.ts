import { DeliveryStatus } from '../../core/models';

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: 'Pendente',
  PICKED_UP: 'Coletado',
  IN_TRANSIT: 'Em trânsito',
  OUT_FOR_DELIVERY: 'Saiu para entrega',
  DELIVERED: 'Entregue',
  DELAYED: 'Atrasado',
  FAILED: 'Falhou',
};

export const ALL_DELIVERY_STATUSES: DeliveryStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'DELAYED',
  'FAILED',
];

export function getDeliveryStatusLabel(status: DeliveryStatus | string): string {
  return DELIVERY_STATUS_LABELS[status as DeliveryStatus] ?? status;
}
