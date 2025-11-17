package com.example.aicodereview.controller;

import com.example.aicodereview.entity.*;
import com.example.aicodereview.entity.enums.Severity;
import com.example.aicodereview.entity.enums.RunStatus;
import com.example.aicodereview.service.*;
import com.example.aicodereview.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdvancedAnalysisController {
    private static final Logger logger = LoggerFactory.getLogger(AdvancedAnalysisController.class);
    
    @Autowired
    private GitHubApiService gitHubApiService;
    
    @Autowired
    private AdvancedAnalysisService advancedAnalysisService;
    
    @Autowired
    private GitCloneService gitCloneService;
    
    @Autowired
    private RepoRepository repoRepository;
    
    @Autowired
    private PullRequestRepository pullRequestRepository;
    
    @Autowired
    private RunRepository runRepository;
    
    @Autowired
    private FindingRepository findingRepository;
    
    /**
     * Advanced analysis endpoint with real-time progress updates
     * Supports both repository URLs and PR URLs
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeAdvanced(@RequestBody AnalysisRequest request) {
        logger.info("Advanced analysis requested for: {}", request.getPrUrl());
        
        try {
            // Parse GitHub URL (repository or PR)
            String[] parts = parseGitHubUrl(request.getPrUrl());
            if (parts == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid GitHub URL format. Use: https://github.com/owner/repo or https://github.com/owner/repo/pull/123"
                ));
            }
            
            String owner = parts[0];
            String repoName = parts[1];
            Integer prNumber = parts.length > 2 ? Integer.parseInt(parts[2]) : null;
            String fullRepoName = owner + "/" + repoName;
            boolean isRepoAnalysis = (prNumber == null);
            
            // Step 1: Sync with GitHub
            Map<String, Object> response = new HashMap<>();
            response.put("status", "syncing");
            response.put("message", "Syncing with GitHub...");
            
            PullRequest pr = null;
            if (isRepoAnalysis) {
                // For repository analysis, create a synthetic PR object
                pr = new PullRequest();
                pr.setTitle("Repository Analysis: " + fullRepoName);
                pr.setAuthor(owner);
                pr.setSourceBranch("main"); // Default to main branch
                pr.setPrNumber(0); // Use 0 for repo analysis
            } else {
                // For PR analysis, fetch from GitHub
                pr = gitHubApiService.fetchSinglePullRequest(fullRepoName, prNumber);
                if (pr == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Could not fetch pull request from GitHub"
                    ));
                }
            }
            
            // Step 2: Create or get repository
            Repo repo = repoRepository.findByName(fullRepoName).orElseGet(() -> {
                Repo newRepo = new Repo();
                newRepo.setName(fullRepoName);
                // Note: owner and url fields might not exist in Repo entity
                // newRepo.setOwner(owner);
                // newRepo.setUrl("https://github.com/" + fullRepoName);
                return repoRepository.save(newRepo);
            });
            
            pr.setRepo(repo);
            pr = pullRequestRepository.save(pr);
            
            // Step 3: Create analysis run
            Run run = new Run();
            run.setPullRequest(pr);
            run.setStartedAt(LocalDateTime.now());
            run.setStatus(RunStatus.IN_PROGRESS);
            run = runRepository.save(run);
            
            // Step 4: Clone repository
            response.put("status", "cloning");
            response.put("message", "Cloning repository...");
            
            Path workspacePath = null;
            try {
                if (isRepoAnalysis) {
                    // Clone the entire repository (main branch)
                    workspacePath = gitCloneService.clonePullRequest(
                        owner, 
                        repoName, 
                        "main", 
                        0
                    );
                } else {
                    // Clone the pull request branch
                    workspacePath = gitCloneService.clonePullRequest(
                        owner, 
                        repoName, 
                        pr.getSourceBranch(), 
                        prNumber
                    );
                }
                logger.info("Repository cloned successfully to: {}", workspacePath);
                
                // VERIFY the clone actually worked
                if (!Files.exists(workspacePath)) {
                    throw new RuntimeException("Clone failed - workspace does not exist!");
                }
                
                long fileCount = Files.walk(workspacePath)
                    .filter(Files::isRegularFile)
                    .filter(p -> !p.toString().contains(".git"))
                    .count();
                    
                logger.info("Found {} files in cloned repository", fileCount);
                if (fileCount == 0) {
                    throw new RuntimeException("Clone failed - no files found in repository!");
                }
                
                // Step 5: Perform advanced analysis
                response.put("status", "analyzing");
                response.put("message", "Analyzing " + fileCount + " files from REAL repository...");
                
                advancedAnalysisService.performAdvancedAnalysis(run, workspacePath);
                
            } catch (Exception cloneEx) {
                logger.error("Failed to clone repository: {}", cloneEx.getMessage(), cloneEx);
                // FAIL PROPERLY - NO MOCK DATA!
                run.setStatus(RunStatus.FAILED);
                run.setCompletedAt(LocalDateTime.now());
                runRepository.save(run);
                
                throw new RuntimeException("Failed to clone repository: " + cloneEx.getMessage(), cloneEx);
            } finally {
                // Clean up workspace
                if (workspacePath != null) {
                    try {
                        gitCloneService.cleanupWorkspace(workspacePath);
                    } catch (Exception e) {
                        logger.warn("Failed to cleanup workspace: {}", e.getMessage());
                    }
                }
            }
            
            // Step 5: Get findings
            List<Finding> findings = findingRepository.findByRunId(run.getId());
            
            // Calculate metrics
            Map<String, Object> metrics = calculateMetrics(findings);
            
            // Update run status
            run.setStatus(RunStatus.COMPLETED);
            run.setCompletedAt(LocalDateTime.now());
            runRepository.save(run);
            
            // Prepare detailed response
            response.put("success", true);
            response.put("status", "completed");
            response.put("runId", run.getId());
            response.put("analysisType", isRepoAnalysis ? "repository" : "pull_request");
            response.put("repository", fullRepoName);
            response.put("prTitle", pr.getTitle());
            response.put("prAuthor", pr.getAuthor());
            response.put("metrics", metrics);
            response.put("findings", findings.stream()
                .limit(50) // Limit to top 50 findings
                .map(this::mapFindingToDto)
                .collect(Collectors.toList()));
            response.put("summary", generateSummary(findings, metrics));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error during advanced analysis: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Analysis failed: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get analysis progress
     */
    @GetMapping("/progress/{runId}")
    public ResponseEntity<?> getProgress(@PathVariable Long runId) {
        Optional<Run> runOpt = runRepository.findById(runId);
        if (runOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Run run = runOpt.get();
        List<Finding> findings = findingRepository.findByRunId(runId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("runId", runId);
        response.put("status", run.getStatus());
        response.put("startedAt", run.getStartedAt());
        response.put("completedAt", run.getCompletedAt());
        response.put("findingsCount", findings.size());
        
        if (RunStatus.COMPLETED.equals(run.getStatus())) {
            response.put("metrics", calculateMetrics(findings));
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get detailed findings for a run
     */
    @GetMapping("/findings/{runId}")
    public ResponseEntity<?> getFindings(@PathVariable Long runId,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        List<Finding> findings = findingRepository.findByRunId(runId);
        
        // Paginate findings
        int start = page * size;
        int end = Math.min(start + size, findings.size());
        List<Finding> paginatedFindings = findings.subList(start, end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("findings", paginatedFindings.stream()
            .map(this::mapFindingToDto)
            .collect(Collectors.toList()));
        response.put("totalElements", findings.size());
        response.put("totalPages", (findings.size() + size - 1) / size);
        response.put("currentPage", page);
        
        return ResponseEntity.ok(response);
    }
    
    private String[] parseGitHubUrl(String url) {
        // Parse both formats:
        // - https://github.com/owner/repo
        // - https://github.com/owner/repo/pull/123
        if (url == null || !url.contains("github.com")) {
            return null;
        }
        
        try {
            String[] parts = url.split("/");
            if (parts.length < 5) return null;
            
            String owner = parts[3];
            String repo = parts[4];
            
            // Check if it's a PR URL
            if (parts.length >= 7 && "pull".equals(parts[5])) {
                String prNumber = parts[6];
                return new String[]{owner, repo, prNumber};
            }
            
            // It's a repository URL
            return new String[]{owner, repo};
        } catch (Exception e) {
            return null;
        }
    }
    
    private Map<String, Object> calculateMetrics(List<Finding> findings) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Count by severity
        long critical = findings.stream().filter(f -> f.getSeverity() == Severity.HIGH).count();
        long medium = findings.stream().filter(f -> f.getSeverity() == Severity.MEDIUM).count();
        long low = findings.stream().filter(f -> f.getSeverity() == Severity.LOW).count();
        
        // Count by category
        Map<String, Long> byCategory = findings.stream()
            .collect(Collectors.groupingBy(Finding::getCategory, Collectors.counting()));
        
        // Calculate scores
        int securityScore = Math.max(0, 100 - (int)(
            byCategory.getOrDefault("SECURITY", 0L) * 10 + 
            byCategory.getOrDefault("VULNERABILITY", 0L) * 15
        ));
        int performanceScore = Math.max(0, 100 - (int)(byCategory.getOrDefault("PERFORMANCE", 0L) * 8));
        int qualityScore = Math.max(0, 100 - (int)(
            byCategory.getOrDefault("CODE_QUALITY", 0L) * 5 + 
            byCategory.getOrDefault("BEST_PRACTICE", 0L) * 3
        ));
        int overallScore = (securityScore + performanceScore + qualityScore) / 3;
        
        metrics.put("totalFindings", findings.size());
        metrics.put("critical", critical);
        metrics.put("medium", medium);
        metrics.put("low", low);
        metrics.put("byCategory", byCategory);
        metrics.put("securityScore", securityScore);
        metrics.put("performanceScore", performanceScore);
        metrics.put("qualityScore", qualityScore);
        metrics.put("overallScore", overallScore);
        
        // Get unique files affected
        Set<String> affectedFiles = findings.stream()
            .map(Finding::getFilePath)
            .collect(Collectors.toSet());
        metrics.put("affectedFiles", affectedFiles.size());
        
        return metrics;
    }
    
    private Map<String, Object> mapFindingToDto(Finding finding) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", finding.getId());
        dto.put("severity", finding.getSeverity());
        dto.put("category", finding.getCategory());
        dto.put("title", finding.getTitle());
        dto.put("description", finding.getDescription());
        dto.put("filePath", finding.getFilePath());
        dto.put("lineNumber", finding.getLineNumber());
        dto.put("codeSnippet", finding.getCodeSnippet());
        dto.put("isResolved", finding.getIsResolved());
        
        // Add suggested patches if available
        if (finding.getSuggestedPatches() != null && !finding.getSuggestedPatches().isEmpty()) {
            dto.put("suggestions", finding.getSuggestedPatches().stream()
                .map(patch -> {
                    Map<String, Object> patchMap = new HashMap<>();
                    patchMap.put("id", patch.getId());
                    patchMap.put("explanation", patch.getExplanation());
                    // Note: suggestedCode field might not exist, using explanation instead
                    patchMap.put("suggestedCode", patch.getExplanation());
                    return patchMap;
                })
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    private String generateSummary(List<Finding> findings, Map<String, Object> metrics) {
        if (findings.isEmpty()) {
            return "Excellent! No issues found in this pull request. The code appears to be clean and well-written.";
        }
        
        int overallScore = (int) metrics.get("overallScore");
        long critical = (long) metrics.get("critical");
        long total = findings.size();
        
        StringBuilder summary = new StringBuilder();
        
        if (overallScore >= 90) {
            summary.append("Great code quality! ");
        } else if (overallScore >= 70) {
            summary.append("Good code quality with some areas for improvement. ");
        } else if (overallScore >= 50) {
            summary.append("Code needs attention - several issues detected. ");
        } else {
            summary.append("Critical issues found - immediate attention required. ");
        }
        
        summary.append(String.format("Found %d total issues", total));
        if (critical > 0) {
            summary.append(String.format(" including %d critical issues that should be addressed immediately", critical));
        }
        summary.append(".");
        
        // Add top recommendations
        @SuppressWarnings("unchecked")
        Map<String, Long> byCategory = (Map<String, Long>) metrics.get("byCategory");
        if (byCategory.getOrDefault("SECURITY", 0L) > 0) {
            summary.append(" Security vulnerabilities detected - please review and fix.");
        }
        if (byCategory.getOrDefault("PERFORMANCE", 0L) > 3) {
            summary.append(" Performance optimizations recommended.");
        }
        
        return summary.toString();
    }
    
    
    // Request DTO
    public static class AnalysisRequest {
        private String prUrl;
        
        public String getPrUrl() {
            return prUrl;
        }
        
        public void setPrUrl(String prUrl) {
            this.prUrl = prUrl;
        }
    }
}
