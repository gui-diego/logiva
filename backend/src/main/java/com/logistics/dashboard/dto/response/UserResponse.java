package com.logistics.dashboard.dto.response;

import com.logistics.dashboard.domain.enums.UserRole;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private UserRole role;
    private Boolean active;
}
