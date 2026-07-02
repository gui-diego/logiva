package com.logistics.dashboard.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logistics.dashboard.domain.entity.Carrier;
import com.logistics.dashboard.domain.entity.Customer;
import com.logistics.dashboard.domain.entity.Delivery;
import com.logistics.dashboard.domain.entity.DeliveryStatusHistory;
import com.logistics.dashboard.domain.entity.Route;
import com.logistics.dashboard.domain.entity.User;
import com.logistics.dashboard.domain.enums.DeliveryStatus;
import com.logistics.dashboard.domain.repository.CarrierRepository;
import com.logistics.dashboard.domain.repository.CustomerRepository;
import com.logistics.dashboard.domain.repository.DeliveryRepository;
import com.logistics.dashboard.domain.repository.RouteRepository;
import com.logistics.dashboard.domain.repository.UserRepository;
import com.logistics.dashboard.dto.request.CreateDeliveryRequest;
import com.logistics.dashboard.dto.request.UpdateDeliveryStatusRequest;
import com.logistics.dashboard.dto.response.DeliveryResponse;
import com.logistics.dashboard.dto.response.PageResponse;
import com.logistics.dashboard.exception.BusinessException;
import com.logistics.dashboard.exception.ResourceNotFoundException;
import com.logistics.dashboard.mapper.EntityMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final CarrierRepository carrierRepository;
    private final CustomerRepository customerRepository;
    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final DeliverySpecification deliverySpecification;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public PageResponse<DeliveryResponse> findAll(
            DeliveryStatus status,
            Long carrierId,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            String search,
            int page,
            int size) {

        Page<Delivery> result = deliveryRepository.findAll(
                deliverySpecification.withFilters(status, carrierId, dateFrom, dateTo, search),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<DeliveryResponse> content = result.getContent().stream()
                .map(d -> entityMapper.toDeliveryResponse(d, false))
                .toList();

        return PageResponse.<DeliveryResponse>builder()
                .content(content)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public DeliveryResponse findById(Long id) {
        Delivery delivery = getDeliveryWithHistory(id);
        return entityMapper.toDeliveryResponse(delivery, true);
    }

    @Transactional(readOnly = true)
    public DeliveryResponse findByTrackingCode(String trackingCode) {
        Delivery delivery = deliveryRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega não encontrada: " + trackingCode));
        delivery.getStatusHistory().size();
        return entityMapper.toDeliveryResponse(delivery, true);
    }

    @Transactional
    public DeliveryResponse create(CreateDeliveryRequest request) {
        if (deliveryRepository.findByTrackingCode(request.getTrackingCode()).isPresent()) {
            throw new BusinessException("Código de rastreio já existe: " + request.getTrackingCode());
        }

        Carrier carrier = carrierRepository.findById(request.getCarrierId())
                .orElseThrow(() -> new ResourceNotFoundException("Transportadora não encontrada"));
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado"));

        Route route = null;
        if (request.getRouteId() != null) {
            route = routeRepository.findById(request.getRouteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rota não encontrada"));
        }

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        } else {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            assignedTo = userRepository.findByEmail(email).orElse(null);
        }

        Delivery delivery = Delivery.builder()
                .trackingCode(request.getTrackingCode())
                .status(request.getStatus())
                .estimatedDeliveryAt(request.getEstimatedDeliveryAt())
                .originCity(request.getOriginCity())
                .destinationCity(request.getDestinationCity())
                .weightKg(request.getWeightKg())
                .carrier(carrier)
                .customer(customer)
                .route(route)
                .assignedTo(assignedTo)
                .build();

        addStatusHistory(delivery, request.getStatus(), "Entrega criada");
        Delivery saved = deliveryRepository.save(delivery);
        return entityMapper.toDeliveryResponse(saved, true);
    }

    @Transactional
    public DeliveryResponse updateStatus(Long id, UpdateDeliveryStatusRequest request) {
        Delivery delivery = getDeliveryWithHistory(id);

        if (delivery.getStatus() == DeliveryStatus.DELIVERED) {
            throw new BusinessException("Entrega já finalizada. Não é permitido alterar o status.");
        }

        DeliveryStatus newStatus = request.getStatus();

        if (delivery.getStatus() == newStatus) {
            throw new BusinessException("A entrega já está com o status informado");
        }

        delivery.setStatus(newStatus);
        if (newStatus == DeliveryStatus.DELIVERED) {
            delivery.setDeliveredAt(LocalDateTime.now());
        }

        addStatusHistory(delivery, newStatus, request.getNote());
        Delivery saved = deliveryRepository.save(delivery);
        return entityMapper.toDeliveryResponse(saved, true);
    }

    private Delivery getDeliveryWithHistory(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entrega não encontrada: " + id));
        delivery.getStatusHistory().size();
        return delivery;
    }

    private void addStatusHistory(Delivery delivery, DeliveryStatus status, String note) {
        DeliveryStatusHistory history = DeliveryStatusHistory.builder()
                .delivery(delivery)
                .status(status)
                .changedAt(LocalDateTime.now())
                .note(note)
                .build();
        delivery.getStatusHistory().add(history);
    }
}
