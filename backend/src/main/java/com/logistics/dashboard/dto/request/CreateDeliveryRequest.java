package com.logistics.dashboard.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.logistics.dashboard.domain.enums.DeliveryStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDeliveryRequest {

    @NotBlank
    private String trackingCode;

    @NotNull
    private DeliveryStatus status;

    private LocalDateTime estimatedDeliveryAt;

    @NotBlank
    private String originCity;

    @NotBlank
    private String destinationCity;

    private BigDecimal weightKg;

    @NotNull
    private Long carrierId;

    @NotNull
    private Long customerId;

    private Long routeId;

    private Long assignedToId;
}
