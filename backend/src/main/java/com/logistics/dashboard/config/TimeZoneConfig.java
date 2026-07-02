package com.logistics.dashboard.config;

import java.util.TimeZone;

import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class TimeZoneConfig {

  private static final String BRASILIA_ZONE = "America/Sao_Paulo";

  @PostConstruct
  void configureTimeZone() {
    TimeZone.setDefault(TimeZone.getTimeZone(BRASILIA_ZONE));
  }
}
