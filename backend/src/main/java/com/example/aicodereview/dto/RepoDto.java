package com.example.aicodereview.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Data
public class RepoDto {
    private Long id;
    
    @NotBlank(message = "Repository name is required")
    private String name;
    
    @NotBlank(message = "Clone URL is required")
    private String cloneUrl;
    
    private String defaultBranch;
    private String webhookSecret;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
