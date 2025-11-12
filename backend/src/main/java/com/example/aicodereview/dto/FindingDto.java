package com.example.aicodereview.dto;

import com.example.aicodereview.entity.enums.Severity;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FindingDto {
    private Long id;
    private Long runId;
    private String filePath;
    private Integer lineNumber;
    private Integer endLineNumber;
    private Severity severity;
    private String category;
    private String title;
    private String description;
    private String codeSnippet;
    private Boolean isResolved;
    private LocalDateTime createdAt;
    private List<SuggestedPatchDto> suggestedPatches;
}
