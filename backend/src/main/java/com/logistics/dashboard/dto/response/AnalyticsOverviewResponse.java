package com.logistics.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsOverviewResponse {

    private long totalDeliveries;
    private long delivered;
    private long delayed;
    private double onTimeRate;
}
