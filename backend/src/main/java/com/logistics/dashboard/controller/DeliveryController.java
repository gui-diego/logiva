package com.logistics.dashboard.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logistics.dashboard.domain.enums.DeliveryStatus;
import com.logistics.dashboard.dto.request.CreateDeliveryRequest;
import com.logistics.dashboard.dto.request.UpdateDeliveryStatusRequest;
import com.logistics.dashboard.dto.response.DeliveryResponse;
import com.logistics.dashboard.dto.response.PageResponse;
import com.logistics.dashboard.service.DeliveryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
@Tag(name = "Entregas")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    @Operation(summary = "Listar entregas com filtros e paginação")
    public ResponseEntity<PageResponse<DeliveryResponse>> findAll(
            @RequestParam(required = false) DeliveryStatus status,
            @RequestParam(required = false) Long carrierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(deliveryService.findAll(status, carrierId, dateFrom, dateTo, search, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhe da entrega com histórico")
    public ResponseEntity<DeliveryResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.findById(id));
    }

    @GetMapping("/track/{trackingCode}")
    @Operation(summary = "Buscar entrega por código de rastreio")
    public ResponseEntity<DeliveryResponse> findByTrackingCode(@PathVariable String trackingCode) {
        return ResponseEntity.ok(deliveryService.findByTrackingCode(trackingCode));
    }

    @PostMapping
    @Operation(summary = "Criar nova entrega (OPERATOR)")
    public ResponseEntity<DeliveryResponse> create(@Valid @RequestBody CreateDeliveryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deliveryService.create(request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status da entrega")
    public ResponseEntity<DeliveryResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDeliveryStatusRequest request) {
        return ResponseEntity.ok(deliveryService.updateStatus(id, request));
    }
}
