package com.example.aicodereview.controller;

import com.example.aicodereview.dto.PullRequestDto;
import com.example.aicodereview.dto.RunDto;
import com.example.aicodereview.entity.PullRequest;
import com.example.aicodereview.repository.PullRequestRepository;
import com.example.aicodereview.repository.RunRepository;
import com.example.aicodereview.service.PatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pullrequests")
public class PullRequestController {

    private final PullRequestRepository pullRequestRepository;
    private final PatchService patchService;
    private final RunRepository runRepository;

    public PullRequestController(PullRequestRepository pullRequestRepository,
                                 PatchService patchService,
                                 RunRepository runRepository) {
        this.pullRequestRepository = pullRequestRepository;
        this.patchService = patchService;
        this.runRepository = runRepository;
    }

    @GetMapping("/repo/{repoId}")
    public ResponseEntity<List<PullRequestDto>> getPullRequestsByRepo(@PathVariable Long repoId) {
        List<PullRequestDto> prs = pullRequestRepository.findByRepoId(repoId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PullRequestDto> getPullRequestById(@PathVariable Long id) {
        PullRequest pr = pullRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pull request not found"));
        return ResponseEntity.ok(convertToDto(pr));
    }

    @PostMapping("/{prId}/apply-patch")
    public ResponseEntity<?> applyPatch(@PathVariable Long prId,
                                        @RequestBody Map<String, Long> request,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        Long patchId = request.get("patchId");
        if (patchId == null) {
            return ResponseEntity.badRequest().body("patchId is required");
        }
        
        String username = userDetails != null ? userDetails.getUsername() : "system";
        patchService.applyPatch(prId, patchId, username);
        
        return ResponseEntity.ok(Map.of("message", "Patch applied successfully"));
    }

    @GetMapping("/{id}/runs")
    public ResponseEntity<List<RunDto>> getRunsByPullRequest(@PathVariable Long id) {
        List<RunDto> runs = runRepository.findByPullRequestId(id).stream()
                .map(run -> {
                    RunDto dto = new RunDto();
                    dto.setId(run.getId());
                    dto.setPullRequestId(run.getPullRequest().getId());
                    dto.setStatus(run.getStatus());
                    dto.setStartedAt(run.getStartedAt());
                    dto.setCompletedAt(run.getCompletedAt());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(runs);
    }

    private PullRequestDto convertToDto(PullRequest pr) {
        PullRequestDto dto = new PullRequestDto();
        dto.setId(pr.getId());
        dto.setRepoId(pr.getRepo().getId());
        dto.setPrNumber(pr.getPrNumber());
        dto.setTitle(pr.getTitle());
        dto.setDescription(pr.getDescription());
        dto.setAuthor(pr.getAuthor());
        dto.setSourceBranch(pr.getSourceBranch());
        dto.setTargetBranch(pr.getTargetBranch());
        dto.setStatus(pr.getStatus());
        dto.setCreatedAt(pr.getCreatedAt());
        dto.setUpdatedAt(pr.getUpdatedAt());
        dto.setMergedAt(pr.getMergedAt());
        dto.setClosedAt(pr.getClosedAt());
        return dto;
    }
}
