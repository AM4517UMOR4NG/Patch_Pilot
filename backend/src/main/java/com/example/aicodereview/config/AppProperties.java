package com.example.aicodereview.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private String githubWebhookSecret;
    private String jwtSecret;
    private Long jwtExpirationSeconds = 86400L; // 24 hours
    private String corsAllowedOrigins = "http://localhost:5173,http://localhost:3000";
}
