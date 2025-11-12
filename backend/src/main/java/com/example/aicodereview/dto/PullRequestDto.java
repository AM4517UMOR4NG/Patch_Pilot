package com.example.aicodereview.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PullRequestDto {
    private Long id;
    private Long repoId;
    private Integer prNumber;
    private String title;
    private String description;
    private String author;
    private String sourceBranch;
    private String targetBranch;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime mergedAt;
    private LocalDateTime closedAt;
}
