package com.logistics.dashboard.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logistics.dashboard.domain.entity.Carrier;
import com.logistics.dashboard.domain.repository.CarrierRepository;
import com.logistics.dashboard.domain.repository.DeliveryRepository;
import com.logistics.dashboard.dto.request.CreateCarrierRequest;
import com.logistics.dashboard.dto.request.UpdateCarrierRequest;
import com.logistics.dashboard.dto.response.CarrierResponse;
import com.logistics.dashboard.exception.BusinessException;
import com.logistics.dashboard.exception.ResourceNotFoundException;
import com.logistics.dashboard.mapper.EntityMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarrierService {

    private final CarrierRepository carrierRepository;
    private final DeliveryRepository deliveryRepository;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public List<CarrierResponse> findAll() {
        return carrierRepository.findAll().stream()
                .map(entityMapper::toCarrierResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CarrierResponse findById(Long id) {
        return entityMapper.toCarrierResponse(getCarrier(id));
    }

    @Transactional
    public CarrierResponse create(CreateCarrierRequest request) {
        String code = request.getCode().toUpperCase();
        if (carrierRepository.existsByCode(code)) {
            throw new BusinessException("Código já cadastrado: " + code);
        }

        Carrier carrier = Carrier.builder()
                .name(request.getName())
                .code(code)
                .active(true)
                .build();
        return entityMapper.toCarrierResponse(carrierRepository.save(carrier));
    }

    @Transactional
    public CarrierResponse update(Long id, UpdateCarrierRequest request) {
        Carrier carrier = getCarrier(id);
        String code = request.getCode().toUpperCase();

        if (carrierRepository.existsByCodeAndIdNot(code, id)) {
            throw new BusinessException("Código já cadastrado: " + code);
        }

        carrier.setName(request.getName());
        carrier.setCode(code);
        carrier.setActive(request.getActive());

        return entityMapper.toCarrierResponse(carrierRepository.save(carrier));
    }

    @Transactional
    public void delete(Long id) {
        Carrier carrier = getCarrier(id);

        if (deliveryRepository.existsByCarrierId(id)) {
            throw new BusinessException(
                    "Não é possível excluir a transportadora \"" + carrier.getName() + "\" pois existem entregas vinculadas.");
        }

        carrierRepository.delete(carrier);
    }

    private Carrier getCarrier(Long id) {
        return carrierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transportadora não encontrada: " + id));
    }
}
