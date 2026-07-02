package com.logistics.dashboard.service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logistics.dashboard.domain.enums.DeliveryStatus;
import com.logistics.dashboard.domain.repository.DeliveryRepository;
import com.logistics.dashboard.dto.response.AnalyticsOverviewResponse;
import com.logistics.dashboard.dto.response.CarrierPerformanceResponse;
import com.logistics.dashboard.dto.response.DeliveryTrendResponse;
import com.logistics.dashboard.dto.response.StatusCountResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DeliveryRepository deliveryRepository;

    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview() {
        long total = deliveryRepository.count();
        long delivered = deliveryRepository.countByStatus(DeliveryStatus.DELIVERED);
        long delayed = deliveryRepository.countByStatus(DeliveryStatus.DELAYED);
        double onTimeRate = total == 0 ? 0.0 : Math.round((delivered * 1000.0 / total)) / 10.0;

        return AnalyticsOverviewResponse.builder()
                .totalDeliveries(total)
                .delivered(delivered)
                .delayed(delayed)
                .onTimeRate(onTimeRate)
                .build();
    }

    @Transactional(readOnly = true)
    public List<StatusCountResponse> getByStatus() {
        return deliveryRepository.countGroupByStatus().stream()
                .map(row -> StatusCountResponse.builder()
                        .status((DeliveryStatus) row[0])
                        .count((Long) row[1])
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryTrendResponse> getDeliveryTrend(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return deliveryRepository.countByDaySince(since).stream()
                .map(row -> {
                    Object dateObj = row[0];
                    LocalDate date;
                    if (dateObj instanceof Date sqlDate) {
                        date = sqlDate.toLocalDate();
                    } else if (dateObj instanceof LocalDate localDate) {
                        date = localDate;
                    } else if (dateObj instanceof java.util.Date utilDate) {
                        date = new Date(utilDate.getTime()).toLocalDate();
                    } else {
                        date = LocalDate.parse(dateObj.toString().substring(0, 10));
                    }
                    long count = row[1] instanceof Number number ? number.longValue() : Long.parseLong(row[1].toString());
                    return DeliveryTrendResponse.builder()
                            .date(date)
                            .count(count)
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CarrierPerformanceResponse> getCarrierPerformance() {
        return deliveryRepository.carrierPerformance().stream()
                .map(row -> {
                    long delivered = (Long) row[2];
                    long delayed = (Long) row[3];
                    long total = (Long) row[4];
                    double successRate = total == 0 ? 0.0 : Math.round((delivered * 1000.0 / total)) / 10.0;
                    return CarrierPerformanceResponse.builder()
                            .carrierId((Long) row[0])
                            .carrierName((String) row[1])
                            .delivered(delivered)
                            .delayed(delayed)
                            .total(total)
                            .successRate(successRate)
                            .build();
                })
                .toList();
    }
}
