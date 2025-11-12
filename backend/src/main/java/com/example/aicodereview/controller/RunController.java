package com.example.aicodereview.controller;

import com.example.aicodereview.dto.RunDto;
import com.example.aicodereview.service.RunService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/runs")
public class RunController {

    private final RunService runService;

    public RunController(RunService runService) {
        this.runService = runService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<RunDto> getRunById(@PathVariable Long id) {
        return ResponseEntity.ok(runService.getRunById(id));
    }

    @GetMapping("/pull-request/{pullRequestId}")
    public ResponseEntity<List<RunDto>> getRunsByPullRequest(@PathVariable Long pullRequestId) {
        return ResponseEntity.ok(runService.getRunsByPullRequest(pullRequestId));
    }
}
