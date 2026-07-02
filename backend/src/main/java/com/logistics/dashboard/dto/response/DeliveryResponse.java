package com.logistics.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.logistics.dashboard.domain.enums.DeliveryStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeliveryResponse {

    private Long id;
    private String trackingCode;
    private DeliveryStatus status;
    private LocalDateTime estimatedDeliveryAt;
    private LocalDateTime deliveredAt;
    private String originCity;
    private String destinationCity;
    private BigDecimal weightKg;
    private Long carrierId;
    private String carrierName;
    private Long customerId;
    private String customerName;
    private Long routeId;
    private String routeName;
    private Long assignedToId;
    private String assignedToEmail;
    private LocalDateTime createdAt;
    private List<StatusHistoryResponse> statusHistory;
}
