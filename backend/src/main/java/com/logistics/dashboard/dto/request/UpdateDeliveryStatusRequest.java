package com.logistics.dashboard.dto.request;

import com.logistics.dashboard.domain.enums.DeliveryStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateDeliveryStatusRequest {

    @NotNull
    private DeliveryStatus status;

    private String note;
}
