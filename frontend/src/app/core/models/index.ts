export type UserRole = 'ADMIN' | 'OPERATOR';

export type DeliveryStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELAYED'
  | 'FAILED';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface StatusHistory {
  status: DeliveryStatus;
  changedAt: string;
  note?: string;
}

export interface Delivery {
  id: number;
  trackingCode: string;
  status: DeliveryStatus;
  estimatedDeliveryAt?: string;
  deliveredAt?: string;
  originCity: string;
  destinationCity: string;
  weightKg?: number;
  carrierId: number;
  carrierName: string;
  customerId: number;
  customerName: string;
  routeId?: number;
  routeName?: string;
  assignedToId?: number;
  assignedToEmail?: string;
  createdAt: string;
  statusHistory?: StatusHistory[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Carrier {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  document?: string;
  city?: string;
}

export interface CreateDeliveryRequest {
  trackingCode: string;
  status: DeliveryStatus;
  estimatedDeliveryAt?: string;
  originCity: string;
  destinationCity: string;
  weightKg?: number;
  carrierId: number;
  customerId: number;
}

export interface CreateCustomerRequest {
  name: string;
  document?: string;
  city?: string;
}

export interface UpdateCustomerRequest {
  name: string;
  document?: string;
  city?: string;
}

export interface UpdateCarrierRequest {
  name: string;
  code: string;
  active: boolean;
}

export interface CreateCarrierRequest {
  name: string;
  code: string;
}

export interface AnalyticsOverview {
  totalDeliveries: number;
  delivered: number;
  delayed: number;
  onTimeRate: number;
}

export interface StatusCount {
  status: DeliveryStatus;
  count: number;
}

export interface DeliveryTrend {
  date: string;
  count: number;
}

export interface CarrierPerformance {
  carrierId: number;
  carrierName: string;
  delivered: number;
  delayed: number;
  total: number;
  successRate: number;
}
