package com.example.aicodereview.controller;

import com.example.aicodereview.entity.PullRequest;
import com.example.aicodereview.service.GitHubApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {
    private static final Logger logger = LoggerFactory.getLogger(TestController.class);
    
    private final GitHubApiService gitHubApiService;
    
    public TestController(GitHubApiService gitHubApiService) {
        this.gitHubApiService = gitHubApiService;
    }
    
    /**
     * Test endpoint to analyze GitHub repository without authentication
     * This is for testing purposes only
     */
    @PostMapping("/github/{repoName:.+}")
    public ResponseEntity<?> testGitHubSync(@PathVariable String repoName) {
        logger.info("Test GitHub sync requested for repository: {}", repoName);
        
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
    
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("message", "Test controller is working");
        status.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(status);
    }
}
