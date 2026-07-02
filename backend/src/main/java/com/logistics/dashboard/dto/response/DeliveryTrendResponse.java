package com.logistics.dashboard.dto.response;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeliveryTrendResponse {

    private LocalDate date;
    private long count;
}
