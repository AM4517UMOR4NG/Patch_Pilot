package com.example.aicodereview.controller;

import com.example.aicodereview.entity.PullRequest;
import com.example.aicodereview.service.GitHubApiService;
import com.example.aicodereview.service.PullRequestPollingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
public class GitHubSyncController {
    private static final Logger logger = LoggerFactory.getLogger(GitHubSyncController.class);
    
    private final GitHubApiService gitHubApiService;
    private final PullRequestPollingService pollingService;
    
    public GitHubSyncController(GitHubApiService gitHubApiService,
                                PullRequestPollingService pollingService) {
        this.gitHubApiService = gitHubApiService;
        this.pollingService = pollingService;
    }
    
    /**
     * Manually fetch and analyze all open pull requests for a repository
     */
    @PostMapping("/sync/{repoName:.+}")
    public ResponseEntity<?> syncRepository(@PathVariable String repoName) {
        logger.info("Manual sync requested for repository: {}", repoName);
        
        try {
            List<PullRequest> pullRequests = gitHubApiService.fetchPullRequests(repoName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("repository", repoName);
            response.put("pullRequestsFound", pullRequests.size());
            response.put("message", String.format("Successfully fetched and queued %d pull requests for analysis", 
                pullRequests.size()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error syncing repository {}: {}", repoName, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("repository", repoName);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Alternate mapping: accept owner and repo as separate segments
     */
    @PostMapping("/sync/{owner}/{repo}")
    public ResponseEntity<?> syncRepositoryBySegments(@PathVariable String owner, @PathVariable String repo) {
        String repoName = owner + "/" + repo;
        logger.info("Manual sync requested for repository (segments): {}", repoName);
        try {
            List<PullRequest> pullRequests = gitHubApiService.fetchPullRequests(repoName);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("repository", repoName);
            response.put("pullRequestsFound", pullRequests.size());
            response.put("message", String.format("Successfully fetched and queued %d pull requests for analysis", pullRequests.size()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error syncing repository {}: {}", repoName, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("repository", repoName);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Fetch and analyze a specific pull request
     */
    @PostMapping("/sync/{repoName:.+}/pr/{prNumber}")
    public ResponseEntity<?> syncPullRequest(@PathVariable String repoName, 
                                            @PathVariable int prNumber) {
        logger.info("Manual sync requested for PR #{} in repository: {}", prNumber, repoName);
        
        try {
            PullRequest pullRequest = gitHubApiService.fetchSinglePullRequest(repoName, prNumber);
            
            if (pullRequest == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("error", "Pull request not found or could not be fetched");
                errorResponse.put("repository", repoName);
                errorResponse.put("prNumber", prNumber);
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("repository", repoName);
            response.put("prNumber", prNumber);
            response.put("prTitle", pullRequest.getTitle());
            response.put("prAuthor", pullRequest.getAuthor());
            response.put("message", "Pull request fetched and queued for analysis");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error syncing PR #{} for repository {}: {}", prNumber, repoName, e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("repository", repoName);
            errorResponse.put("prNumber", prNumber);
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Start automatic polling for all registered repositories
     */
    @PostMapping("/polling/start")
    public ResponseEntity<?> startPolling() {
        logger.info("Starting automatic polling for all repositories");
        
        pollingService.startPolling();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Polling started successfully");
        response.put("pollingInterval", pollingService.getPollingInterval());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Stop automatic polling
     */
    @PostMapping("/polling/stop")
    public ResponseEntity<?> stopPolling() {
        logger.info("Stopping automatic polling");
        
        pollingService.stopPolling();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Polling stopped successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get polling status
     */
    @GetMapping("/polling/status")
    public ResponseEntity<?> getPollingStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("isPolling", pollingService.isPolling());
        response.put("pollingInterval", pollingService.getPollingInterval());
        response.put("lastPollTime", pollingService.getLastPollTime());
        response.put("nextPollTime", pollingService.getNextPollTime());
        
        return ResponseEntity.ok(response);
    }
}
