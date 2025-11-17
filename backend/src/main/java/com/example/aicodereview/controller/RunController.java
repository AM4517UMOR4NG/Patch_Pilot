package com.example.aicodereview.controller;

import com.example.aicodereview.dto.RunDto;
import com.example.aicodereview.dto.FindingDto;
import com.example.aicodereview.service.RunService;
import com.example.aicodereview.repository.FindingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/runs")
public class RunController {

    private final RunService runService;
    private final FindingRepository findingRepository;

    public RunController(RunService runService, FindingRepository findingRepository) {
        this.runService = runService;
        this.findingRepository = findingRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<RunDto> getRunById(@PathVariable Long id) {
        return ResponseEntity.ok(runService.getRunById(id));
    }

    @GetMapping("/pull-request/{pullRequestId}")
    public ResponseEntity<List<RunDto>> getRunsByPullRequest(@PathVariable Long pullRequestId) {
        return ResponseEntity.ok(runService.getRunsByPullRequest(pullRequestId));
    }

    @GetMapping("/{id}/findings")
    public ResponseEntity<List<FindingDto>> getFindingsByRun(@PathVariable Long id) {
        List<FindingDto> findings = findingRepository.findByRunId(id).stream()
                .map(finding -> {
                    FindingDto dto = new FindingDto();
                    dto.setId(finding.getId());
                    dto.setRunId(finding.getRun().getId());
                    dto.setFilePath(finding.getFilePath());
                    dto.setLineNumber(finding.getLineNumber());
                    dto.setTitle(finding.getTitle());
                    dto.setDescription(finding.getDescription());
                    dto.setCategory(finding.getCategory());
                    dto.setSeverity(finding.getSeverity());
                    dto.setCodeSnippet(finding.getCodeSnippet());
                    dto.setIsResolved(finding.getIsResolved());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(findings);
    }
}
