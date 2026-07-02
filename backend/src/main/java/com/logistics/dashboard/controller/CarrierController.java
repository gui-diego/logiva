package com.logistics.dashboard.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logistics.dashboard.dto.request.CreateCarrierRequest;
import com.logistics.dashboard.dto.request.UpdateCarrierRequest;
import com.logistics.dashboard.dto.response.CarrierResponse;
import com.logistics.dashboard.service.CarrierService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/carriers")
@RequiredArgsConstructor
@Tag(name = "Transportadoras")
public class CarrierController {

    private final CarrierService carrierService;

    @GetMapping
    @Operation(summary = "Listar transportadoras")
    public ResponseEntity<List<CarrierResponse>> findAll() {
        return ResponseEntity.ok(carrierService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar transportadora por ID")
    public ResponseEntity<CarrierResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(carrierService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar transportadora (ADMIN)")
    public ResponseEntity<CarrierResponse> create(@Valid @RequestBody CreateCarrierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(carrierService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar transportadora (ADMIN)")
    public ResponseEntity<CarrierResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCarrierRequest request) {
        return ResponseEntity.ok(carrierService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir transportadora (ADMIN)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        carrierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
