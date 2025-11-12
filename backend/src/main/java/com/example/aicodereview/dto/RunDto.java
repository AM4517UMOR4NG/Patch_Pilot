package com.example.aicodereview.dto;

import com.example.aicodereview.entity.enums.RunStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class RunDto {
    private Long id;
    private Long pullRequestId;
    private RunStatus status;
    private String commitSha;
    private String triggeredBy;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String errorMessage;
    private List<FindingDto> findings;
}
