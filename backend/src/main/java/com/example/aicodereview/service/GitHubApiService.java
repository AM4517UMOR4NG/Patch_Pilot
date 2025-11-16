package com.example.aicodereview.service;

import com.example.aicodereview.entity.PullRequest;
import com.example.aicodereview.entity.Repo;
import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.enums.RunStatus;
import com.example.aicodereview.repository.PullRequestRepository;
import com.example.aicodereview.repository.RepoRepository;
import com.example.aicodereview.repository.RunRepository;
import com.example.aicodereview.util.RepoNameUtils;
import org.kohsuke.github.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GitHubApiService {
    private static final Logger logger = LoggerFactory.getLogger(GitHubApiService.class);
    
    private final RepoRepository repoRepository;
    private final PullRequestRepository pullRequestRepository;
    private final RunRepository runRepository;
    private final RunnerService runnerService;
    
    @Value("${app.github-token:}")
    private String githubToken;
    
    private GitHub github;
    
    public GitHubApiService(RepoRepository repoRepository,
                           PullRequestRepository pullRequestRepository,
                           RunRepository runRepository,
                           RunnerService runnerService) {
        this.repoRepository = repoRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.runRepository = runRepository;
        this.runnerService = runnerService;
    }
    
    private GitHub getGitHub() throws IOException {
        if (github == null) {
            if (githubToken != null && !githubToken.isEmpty()) {
                github = new GitHubBuilder().withOAuthToken(githubToken).build();
                logger.info("Connected to GitHub with authentication token");
            } else {
                github = new GitHubBuilder().build();
                logger.warn("Connected to GitHub without authentication (rate limits apply)");
            }
        }
        return github;
    }
    
    public List<PullRequest> fetchPullRequests(String repoName) {
        List<PullRequest> pullRequests = new ArrayList<>();
        
        String normalizedRepoName = RepoNameUtils.normalize(repoName);
        Repo repo = repoRepository.findByNameIgnoreCase(normalizedRepoName)
                .orElseGet(() -> registerRepository(normalizedRepoName));
        String repositoryFullName = RepoNameUtils.normalize(repo.getName(), repo.getCloneUrl());
        if (!repositoryFullName.equals(repo.getName())) {
            repo.setName(repositoryFullName);
            repoRepository.save(repo);
        }
        
        try {
            // Connect to GitHub and get the repository
            GitHub github = getGitHub();
            GHRepository ghRepo = github.getRepository(repositoryFullName);
            
            // Fetch all open pull requests
            List<GHPullRequest> ghPullRequests = ghRepo.getPullRequests(GHIssueState.OPEN);
            logger.info("Found {} open pull requests for repository: {}", ghPullRequests.size(), repoName);
            
            for (GHPullRequest ghPr : ghPullRequests) {
                PullRequest pr = processPullRequest(repo, ghPr);
                pullRequests.add(pr);
                
                // Check if we should create a new run for this PR
                if (shouldAnalyzePullRequest(pr)) {
                    createAndTriggerRun(pr, ghPr);
                }
            }
            
        } catch (IOException e) {
            logger.warn("Authenticated GitHub request failed for repo {}: {}. Retrying unauthenticated...", repoName, e.getMessage());
            try {
                GitHub githubNoAuth = new GitHubBuilder().build();
                GHRepository ghRepo = githubNoAuth.getRepository(repositoryFullName);
                List<GHPullRequest> ghPullRequests = ghRepo.getPullRequests(GHIssueState.OPEN);
                logger.info("[Fallback] Found {} open pull requests for repository: {}", ghPullRequests.size(), repoName);
                for (GHPullRequest ghPr : ghPullRequests) {
                    PullRequest pr = processPullRequest(repo, ghPr);
                    pullRequests.add(pr);
                    if (shouldAnalyzePullRequest(pr)) {
                        createAndTriggerRun(pr, ghPr);
                    }
                }
            } catch (IOException ex) {
                logger.error("Error fetching pull requests from GitHub after fallback: ", ex);
            }
        }
        
        return pullRequests;
    }
    
    public PullRequest fetchSinglePullRequest(String repoName, int prNumber) {
        String normalizedRepoName = RepoNameUtils.normalize(repoName);
        Repo repo = repoRepository.findByNameIgnoreCase(normalizedRepoName)
                .orElseGet(() -> registerRepository(normalizedRepoName));
        String repositoryFullName = RepoNameUtils.normalize(repo.getName(), repo.getCloneUrl());
        if (!repositoryFullName.equals(repo.getName())) {
            repo.setName(repositoryFullName);
            repoRepository.save(repo);
        }
        try {
            GitHub github = getGitHub();
            GHRepository ghRepo = github.getRepository(repositoryFullName);
            GHPullRequest ghPr = ghRepo.getPullRequest(prNumber);
            
            PullRequest pr = processPullRequest(repo, ghPr);
            
            // Always create a run for manually fetched PRs
            createAndTriggerRun(pr, ghPr);
            
            return pr;
            
        } catch (IOException e) {
            logger.warn("Authenticated GitHub request failed for PR #{} in repo {}: {}. Retrying unauthenticated...", prNumber, repoName, e.getMessage());
            try {
                GitHub githubNoAuth = new GitHubBuilder().build();
                GHRepository ghRepo = githubNoAuth.getRepository(repositoryFullName);
                GHPullRequest ghPr = ghRepo.getPullRequest(prNumber);
                PullRequest pr = processPullRequest(repo, ghPr);
                createAndTriggerRun(pr, ghPr);
                return pr;
            } catch (IOException ex) {
                logger.error("Error fetching pull request #{} from GitHub after fallback: ", prNumber, ex);
                return null;
            }
        }
    }
    
    private PullRequest processPullRequest(Repo repo, GHPullRequest ghPr) throws IOException {
        // Check if PR already exists
        Optional<PullRequest> existingPr = pullRequestRepository
                .findByRepoIdAndPrNumber(repo.getId(), ghPr.getNumber());
        
        PullRequest pr;
        if (existingPr.isPresent()) {
            pr = existingPr.get();
        } else {
            pr = new PullRequest();
            pr.setRepo(repo);
            pr.setPrNumber(ghPr.getNumber());
        }
        
        // Update PR information
        pr.setTitle(ghPr.getTitle());
        pr.setDescription(ghPr.getBody());
        pr.setAuthor(ghPr.getUser().getLogin());
        pr.setSourceBranch(ghPr.getHead().getRef());
        pr.setTargetBranch(ghPr.getBase().getRef());
        pr.setStatus(ghPr.getState().toString());
        
        // Convert dates
        if (ghPr.getCreatedAt() != null) {
            pr.setCreatedAt(convertToLocalDateTime(ghPr.getCreatedAt()));
        }
        if (ghPr.getUpdatedAt() != null) {
            pr.setUpdatedAt(convertToLocalDateTime(ghPr.getUpdatedAt()));
        }
        if (ghPr.getMergedAt() != null) {
            pr.setMergedAt(convertToLocalDateTime(ghPr.getMergedAt()));
        }
        if (ghPr.getClosedAt() != null) {
            pr.setClosedAt(convertToLocalDateTime(ghPr.getClosedAt()));
        }
        
        return pullRequestRepository.save(pr);
    }
    
    private boolean shouldAnalyzePullRequest(PullRequest pr) {
        // Check if there's already a recent run for this PR
        List<Run> recentRuns = runRepository.findByPullRequestId(pr.getId());
        
        if (recentRuns.isEmpty()) {
            return true;
        }
        
        // Check if the last run is older than 1 hour or failed
        Run lastRun = recentRuns.get(0);
        if (lastRun.getStatus() == RunStatus.FAILED) {
            return true;
        }
        
        if (lastRun.getCreatedAt() != null) {
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            return lastRun.getCreatedAt().isBefore(oneHourAgo);
        }
        
        return false;
    }
    
    private void createAndTriggerRun(PullRequest pr, GHPullRequest ghPr) {
        try {
            Run run = new Run();
            run.setPullRequest(pr);
            run.setStatus(RunStatus.PENDING);
            run.setCommitSha(ghPr.getHead().getSha());
            run.setTriggeredBy("github-api");
            run = runRepository.save(run);
            
            logger.info("Created run {} for PR #{}", run.getId(), pr.getPrNumber());
            
            // Trigger async processing
            runnerService.triggerRun(run.getId());
            
        } catch (Exception e) {
            logger.error("Error creating run for PR #{}: ", pr.getPrNumber(), e);
        }
    }
    
    private LocalDateTime convertToLocalDateTime(Date date) {
        if (date == null) {
            return null;
        }
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
    
    public List<GHContent> fetchPullRequestFiles(String repoName, int prNumber) {
        List<GHContent> files = new ArrayList<>();
        
        try {
            GitHub github = getGitHub();
            String normalizedRepoName = RepoNameUtils.normalize(repoName);
            GHRepository ghRepo = github.getRepository(normalizedRepoName);
            GHPullRequest ghPr = ghRepo.getPullRequest(prNumber);
            
            // Get the list of changed files
            PagedIterable<GHPullRequestFileDetail> changedFiles = ghPr.listFiles();
            
            for (GHPullRequestFileDetail fileDetail : changedFiles) {
                try {
                    // Fetch the actual content of the file from the head branch
                    GHContent content = ghRepo.getFileContent(fileDetail.getFilename(), ghPr.getHead().getSha());
                    files.add(content);
                } catch (IOException e) {
                    logger.warn("Could not fetch content for file: {}", fileDetail.getFilename());
                }
            }
            
            logger.info("Fetched {} files for PR #{}", files.size(), prNumber);
            
        } catch (IOException e) {
            logger.error("Error fetching PR files from GitHub: ", e);
        }
        
        return files;
    }
    
    public String fetchFileContent(String repoName, String filepath, String commitSha) {
        try {
            GitHub github = getGitHub();
            String normalizedRepoName = RepoNameUtils.normalize(repoName);
            GHRepository ghRepo = github.getRepository(normalizedRepoName);
            GHContent content = ghRepo.getFileContent(filepath, commitSha);
            
            // Read content using the input stream to avoid deprecated method
            byte[] bytes = content.read().readAllBytes();
            return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            
        } catch (IOException e) {
            logger.error("Error fetching file content from GitHub: ", e);
            return null;
        }
    }
    
    private Repo registerRepository(String normalizedRepoName) {
        logger.info("Registering repository {} on the fly", normalizedRepoName);
        Repo repo = new Repo();
        repo.setName(normalizedRepoName);
        repo.setCloneUrl("https://github.com/" + normalizedRepoName + ".git");
        return repoRepository.save(repo);
    }
}
