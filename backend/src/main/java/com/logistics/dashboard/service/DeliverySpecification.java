package com.logistics.dashboard.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.logistics.dashboard.domain.entity.Delivery;
import com.logistics.dashboard.domain.enums.DeliveryStatus;

import jakarta.persistence.criteria.Predicate;

@Component
public class DeliverySpecification {

    public Specification<Delivery> withFilters(
            DeliveryStatus status,
            Long carrierId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (carrierId != null) {
                predicates.add(cb.equal(root.get("carrier").get("id"), carrierId));
            }
            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("estimatedDeliveryAt"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("estimatedDeliveryAt"), dateTo));
            }
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("trackingCode")), pattern),
                        cb.like(cb.lower(root.get("destinationCity")), pattern),
                        cb.like(cb.lower(root.get("originCity")), pattern)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
