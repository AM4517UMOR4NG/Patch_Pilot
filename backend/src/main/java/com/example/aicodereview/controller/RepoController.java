package com.example.aicodereview.controller;

import com.example.aicodereview.dto.RepoDto;
import com.example.aicodereview.dto.PullRequestDto;
import com.example.aicodereview.service.RepoService;
import com.example.aicodereview.service.GitHubApiService;
import com.example.aicodereview.repository.PullRequestRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repos")
public class RepoController {

    private final RepoService repoService;
    private final PullRequestRepository pullRequestRepository;
    private final GitHubApiService gitHubApiService;

    public RepoController(RepoService repoService, PullRequestRepository pullRequestRepository, GitHubApiService gitHubApiService) {
        this.repoService = repoService;
        this.pullRequestRepository = pullRequestRepository;
        this.gitHubApiService = gitHubApiService;
    }

    @GetMapping
    public ResponseEntity<List<RepoDto>> getAllRepos() {
        return ResponseEntity.ok(repoService.getAllRepos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepoDto> getRepoById(@PathVariable Long id) {
        return ResponseEntity.ok(repoService.getRepoById(id));
    }

    @PostMapping
    public ResponseEntity<RepoDto> createRepo(@Valid @RequestBody RepoDto repoDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repoService.createRepo(repoDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepoDto> updateRepo(@PathVariable Long id, @Valid @RequestBody RepoDto repoDto) {
        return ResponseEntity.ok(repoService.updateRepo(id, repoDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepo(@PathVariable Long id) {
        repoService.deleteRepo(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pull-requests")
    public ResponseEntity<List<PullRequestDto>> getPullRequestsByRepo(@PathVariable Long id) {
        List<PullRequestDto> pullRequests = pullRequestRepository.findByRepoId(id)
            .stream()
            .map(pr -> {
                PullRequestDto dto = new PullRequestDto();
                dto.setId(pr.getId());
                dto.setRepoId(pr.getRepo().getId());
                dto.setPrNumber(pr.getPrNumber());
                dto.setTitle(pr.getTitle());
                dto.setAuthor(pr.getAuthor());
                dto.setSourceBranch(pr.getSourceBranch());
                dto.setTargetBranch(pr.getTargetBranch());
                return dto;
            })
            .toList();
        return ResponseEntity.ok(pullRequests);
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getRepoStats(@PathVariable Long id) {
        RepoDto repo = repoService.getRepoById(id);
        Map<String, Object> stats = gitHubApiService.getRepositoryStats(repo.getName());
        return ResponseEntity.ok(stats);
    }
}
