package com.logistics.dashboard.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logistics.dashboard.domain.entity.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {
}
