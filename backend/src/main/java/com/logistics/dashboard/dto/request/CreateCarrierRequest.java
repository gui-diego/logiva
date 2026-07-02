package com.logistics.dashboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCarrierRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;
}
