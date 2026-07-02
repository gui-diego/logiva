package com.logistics.dashboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCarrierRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    @NotNull
    private Boolean active;
}
