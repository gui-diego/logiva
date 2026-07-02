package com.logistics.dashboard.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.logistics.dashboard.domain.entity.Customer;
import com.logistics.dashboard.domain.repository.CustomerRepository;
import com.logistics.dashboard.domain.repository.DeliveryRepository;
import com.logistics.dashboard.dto.request.CreateCustomerRequest;
import com.logistics.dashboard.dto.request.UpdateCustomerRequest;
import com.logistics.dashboard.dto.response.CustomerResponse;
import com.logistics.dashboard.exception.BusinessException;
import com.logistics.dashboard.exception.ResourceNotFoundException;
import com.logistics.dashboard.mapper.EntityMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final DeliveryRepository deliveryRepository;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll() {
        return customerRepository.findAll().stream()
                .map(entityMapper::toCustomerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        return entityMapper.toCustomerResponse(getCustomer(id));
    }

    @Transactional
    public CustomerResponse create(CreateCustomerRequest request) {
        validateDocumentUnique(request.getDocument(), null);

        Customer customer = Customer.builder()
                .name(request.getName())
                .document(normalizeDocument(request.getDocument()))
                .city(request.getCity())
                .build();
        return entityMapper.toCustomerResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Long id, UpdateCustomerRequest request) {
        Customer customer = getCustomer(id);
        validateDocumentUnique(request.getDocument(), id);

        customer.setName(request.getName());
        customer.setDocument(normalizeDocument(request.getDocument()));
        customer.setCity(request.getCity());

        return entityMapper.toCustomerResponse(customerRepository.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        Customer customer = getCustomer(id);

        if (deliveryRepository.existsByCustomerId(id)) {
            throw new BusinessException(
                    "Não é possível excluir o cliente \"" + customer.getName() + "\" pois existem entregas vinculadas.");
        }

        customerRepository.delete(customer);
    }

    private Customer getCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado: " + id));
    }

    private void validateDocumentUnique(String document, Long excludeId) {
        String normalized = normalizeDocument(document);
        if (!StringUtils.hasText(normalized)) {
            return;
        }

        boolean exists = excludeId == null
                ? customerRepository.existsByDocument(normalized)
                : customerRepository.existsByDocumentAndIdNot(normalized, excludeId);

        if (exists) {
            throw new BusinessException("Documento já cadastrado: " + normalized);
        }
    }

    private String normalizeDocument(String document) {
        return StringUtils.hasText(document) ? document.trim() : null;
    }
}
