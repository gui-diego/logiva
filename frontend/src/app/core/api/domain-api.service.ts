import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import {
  AnalyticsOverview,
  Carrier,
  CarrierPerformance,
  CreateCarrierRequest,
  CreateCustomerRequest,
  CreateDeliveryRequest,
  Customer,
  UpdateCarrierRequest,
  UpdateCustomerRequest,
  Delivery,
  DeliveryStatus,
  DeliveryTrend,
  PageResponse,
  StatusCount,
  User,
} from '../models';

@Injectable({ providedIn: 'root' })
export class DeliveryApiService {
  private readonly api = inject(ApiService);

  list(params: {
    status?: DeliveryStatus;
    carrierId?: number;
    search?: string;
    page?: number;
    size?: number;
  }) {
    return this.api.get<PageResponse<Delivery>>('/deliveries', params as Record<string, string | number>);
  }

  getById(id: number) {
    return this.api.get<Delivery>(`/deliveries/${id}`);
  }

  updateStatus(id: number, status: DeliveryStatus, note?: string) {
    return this.api.patch<Delivery>(`/deliveries/${id}/status`, { status, note });
  }

  create(body: CreateDeliveryRequest) {
    return this.api.post<Delivery>('/deliveries', body);
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly api = inject(ApiService);

  overview() {
    return this.api.get<AnalyticsOverview>('/analytics/overview');
  }

  byStatus() {
    return this.api.get<StatusCount[]>('/analytics/by-status');
  }

  deliveryTrend(days = 7) {
    return this.api.get<DeliveryTrend[]>('/analytics/delivery-trend', { days });
  }

  carrierPerformance() {
    return this.api.get<CarrierPerformance[]>('/analytics/carrier-performance');
  }
}

@Injectable({ providedIn: 'root' })
export class CarrierApiService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<Carrier[]>('/carriers');
  }

  create(body: CreateCarrierRequest) {
    return this.api.post<Carrier>('/carriers', body);
  }

  update(id: number, body: UpdateCarrierRequest) {
    return this.api.put<Carrier>(`/carriers/${id}`, body);
  }

  delete(id: number) {
    return this.api.delete<void>(`/carriers/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<Customer[]>('/customers');
  }

  getById(id: number) {
    return this.api.get<Customer>(`/customers/${id}`);
  }

  create(body: CreateCustomerRequest) {
    return this.api.post<Customer>('/customers', body);
  }

  update(id: number, body: UpdateCustomerRequest) {
    return this.api.put<Customer>(`/customers/${id}`, body);
  }

  delete(id: number) {
    return this.api.delete<void>(`/customers/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<User[]>('/users');
  }
}
