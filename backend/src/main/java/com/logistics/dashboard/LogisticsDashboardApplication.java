package com.logistics.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.logistics.dashboard.config.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class LogisticsDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogisticsDashboardApplication.class, args);
    }
}
