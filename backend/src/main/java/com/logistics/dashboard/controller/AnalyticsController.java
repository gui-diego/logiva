package com.logistics.dashboard.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logistics.dashboard.dto.response.AnalyticsOverviewResponse;
import com.logistics.dashboard.dto.response.CarrierPerformanceResponse;
import com.logistics.dashboard.dto.response.DeliveryTrendResponse;
import com.logistics.dashboard.dto.response.StatusCountResponse;
import com.logistics.dashboard.service.AnalyticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @Operation(summary = "KPIs gerais do dashboard")
    public ResponseEntity<AnalyticsOverviewResponse> overview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/by-status")
    @Operation(summary = "Contagem de entregas por status")
    public ResponseEntity<List<StatusCountResponse>> byStatus() {
        return ResponseEntity.ok(analyticsService.getByStatus());
    }

    @GetMapping("/delivery-trend")
    @Operation(summary = "Tendência de entregas por dia")
    public ResponseEntity<List<DeliveryTrendResponse>> deliveryTrend(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(analyticsService.getDeliveryTrend(days));
    }

    @GetMapping("/carrier-performance")
    @Operation(summary = "Performance por transportadora")
    public ResponseEntity<List<CarrierPerformanceResponse>> carrierPerformance() {
        return ResponseEntity.ok(analyticsService.getCarrierPerformance());
    }
}
