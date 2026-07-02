package com.logistics.dashboard.domain.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logistics.dashboard.domain.entity.Delivery;
import com.logistics.dashboard.domain.entity.DeliveryStatusHistory;

public interface DeliveryStatusHistoryRepository extends JpaRepository<DeliveryStatusHistory, Long> {

    List<DeliveryStatusHistory> findByDeliveryOrderByChangedAtAsc(Delivery delivery);
}
