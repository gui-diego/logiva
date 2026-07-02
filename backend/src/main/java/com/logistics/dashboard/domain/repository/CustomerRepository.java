package com.logistics.dashboard.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.logistics.dashboard.domain.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByDocument(String document);

    boolean existsByDocumentAndIdNot(String document, Long id);
}
