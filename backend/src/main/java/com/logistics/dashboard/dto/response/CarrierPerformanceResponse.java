package com.logistics.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CarrierPerformanceResponse {

    private Long carrierId;
    private String carrierName;
    private long delivered;
    private long delayed;
    private long total;
    private double successRate;
}
