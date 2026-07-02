package com.logistics.dashboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateCustomerRequest {

  @NotBlank
  private String name;

  private String document;

  private String city;
}
