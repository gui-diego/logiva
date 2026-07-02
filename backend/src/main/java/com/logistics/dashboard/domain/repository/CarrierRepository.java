package com.logistics.dashboard.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logistics.dashboard.domain.entity.Carrier;

public interface CarrierRepository extends JpaRepository<Carrier, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);
}
