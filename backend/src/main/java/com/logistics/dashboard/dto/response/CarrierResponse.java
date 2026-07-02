package com.logistics.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CarrierResponse {

    private Long id;
    private String name;
    private String code;
    private Boolean active;
}
