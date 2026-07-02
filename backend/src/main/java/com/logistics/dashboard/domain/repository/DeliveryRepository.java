package com.logistics.dashboard.domain.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.logistics.dashboard.domain.entity.Delivery;
import com.logistics.dashboard.domain.enums.DeliveryStatus;

public interface DeliveryRepository extends JpaRepository<Delivery, Long>, JpaSpecificationExecutor<Delivery> {

    Optional<Delivery> findByTrackingCode(String trackingCode);

    boolean existsByCustomerId(Long customerId);

    boolean existsByCarrierId(Long carrierId);

    long countByStatus(DeliveryStatus status);

    @Query("SELECT d.status, COUNT(d) FROM Delivery d GROUP BY d.status")
    List<Object[]> countGroupByStatus();

    @Query(value = """
            SELECT DATE(d.created_at) AS day, COUNT(*) AS total
            FROM deliveries d
            WHERE d.created_at >= :since
            GROUP BY DATE(d.created_at)
            ORDER BY day
            """, nativeQuery = true)
    List<Object[]> countByDaySince(@Param("since") LocalDateTime since);

    @Query("""
            SELECT d.carrier.id, d.carrier.name,
                   SUM(CASE WHEN d.status = 'DELIVERED' THEN 1 ELSE 0 END),
                   SUM(CASE WHEN d.status = 'DELAYED' THEN 1 ELSE 0 END),
                   COUNT(d)
            FROM Delivery d
            GROUP BY d.carrier.id, d.carrier.name
            """)
    List<Object[]> carrierPerformance();
}
