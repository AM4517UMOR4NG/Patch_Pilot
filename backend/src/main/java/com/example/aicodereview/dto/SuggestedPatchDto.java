package com.example.aicodereview.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SuggestedPatchDto {
    private Long id;
    private Long findingId;
    private String unifiedDiff;
    private String explanation;
    private Boolean applied;
    private LocalDateTime appliedAt;
    private String appliedBy;
    private LocalDateTime createdAt;
}
