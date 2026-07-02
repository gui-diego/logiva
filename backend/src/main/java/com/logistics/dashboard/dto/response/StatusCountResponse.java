package com.logistics.dashboard.dto.response;

import com.logistics.dashboard.domain.enums.DeliveryStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatusCountResponse {

    private DeliveryStatus status;
    private long count;
}
