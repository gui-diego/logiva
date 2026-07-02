package com.logistics.dashboard.mapper;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.logistics.dashboard.domain.entity.Carrier;
import com.logistics.dashboard.domain.entity.Customer;
import com.logistics.dashboard.domain.entity.Delivery;
import com.logistics.dashboard.domain.entity.DeliveryStatusHistory;
import com.logistics.dashboard.domain.entity.User;
import com.logistics.dashboard.dto.response.CarrierResponse;
import com.logistics.dashboard.dto.response.CustomerResponse;
import com.logistics.dashboard.dto.response.DeliveryResponse;
import com.logistics.dashboard.dto.response.StatusHistoryResponse;
import com.logistics.dashboard.dto.response.UserResponse;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.getActive())
                .build();
    }

    public CarrierResponse toCarrierResponse(Carrier carrier) {
        return CarrierResponse.builder()
                .id(carrier.getId())
                .name(carrier.getName())
                .code(carrier.getCode())
                .active(carrier.getActive())
                .build();
    }

    public CustomerResponse toCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .document(customer.getDocument())
                .city(customer.getCity())
                .build();
    }

    public DeliveryResponse toDeliveryResponse(Delivery delivery, boolean includeHistory) {
        DeliveryResponse.DeliveryResponseBuilder builder = DeliveryResponse.builder()
                .id(delivery.getId())
                .trackingCode(delivery.getTrackingCode())
                .status(delivery.getStatus())
                .estimatedDeliveryAt(delivery.getEstimatedDeliveryAt())
                .deliveredAt(delivery.getDeliveredAt())
                .originCity(delivery.getOriginCity())
                .destinationCity(delivery.getDestinationCity())
                .weightKg(delivery.getWeightKg())
                .createdAt(delivery.getCreatedAt());

        if (delivery.getCarrier() != null) {
            builder.carrierId(delivery.getCarrier().getId())
                    .carrierName(delivery.getCarrier().getName());
        }
        if (delivery.getCustomer() != null) {
            builder.customerId(delivery.getCustomer().getId())
                    .customerName(delivery.getCustomer().getName());
        }
        if (delivery.getRoute() != null) {
            builder.routeId(delivery.getRoute().getId())
                    .routeName(delivery.getRoute().getName());
        }
        if (delivery.getAssignedTo() != null) {
            builder.assignedToId(delivery.getAssignedTo().getId())
                    .assignedToEmail(delivery.getAssignedTo().getEmail());
        }

        if (includeHistory && delivery.getStatusHistory() != null) {
            List<StatusHistoryResponse> history = delivery.getStatusHistory().stream()
                    .sorted(Comparator.comparing(DeliveryStatusHistory::getChangedAt))
                    .map(h -> StatusHistoryResponse.builder()
                            .status(h.getStatus())
                            .changedAt(h.getChangedAt())
                            .note(h.getNote())
                            .build())
                    .toList();
            builder.statusHistory(history);
        }

        return builder.build();
    }
}
