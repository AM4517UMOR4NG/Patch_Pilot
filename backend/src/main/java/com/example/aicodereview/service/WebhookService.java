package com.example.aicodereview.service;

import com.example.aicodereview.entity.PullRequest;
import com.example.aicodereview.entity.Repo;
import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.enums.RunStatus;
import com.example.aicodereview.repository.PullRequestRepository;
import com.example.aicodereview.repository.RepoRepository;
import com.example.aicodereview.repository.RunRepository;
import com.example.aicodereview.util.SignatureVerifier;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class WebhookService {

    private final SignatureVerifier signatureVerifier;
    private final RepoRepository repoRepository;
    private final PullRequestRepository pullRequestRepository;
    private final RunRepository runRepository;
    private final RunnerService runnerService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public WebhookService(SignatureVerifier signatureVerifier,
                         RepoRepository repoRepository,
                         PullRequestRepository pullRequestRepository,
                         RunRepository runRepository,
                         RunnerService runnerService) {
        this.signatureVerifier = signatureVerifier;
        this.repoRepository = repoRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.runRepository = runRepository;
        this.runnerService = runnerService;
    }

    public void processGithubWebhook(String payload, String signature) {
        // Get secret from environment or config
        String secret = System.getenv("GITHUB_WEBHOOK_SECRET");
        if (secret == null) {
            secret = "default-webhook-secret"; // For development only
        }

        if (!signatureVerifier.verifySignature(payload, signature, secret)) {
            throw new RuntimeException("Invalid webhook signature");
        }

        try {
            JsonNode json = objectMapper.readTree(payload);
            String action = json.path("action").asText();
            
            if ("opened".equals(action) || "synchronize".equals(action)) {
                processPullRequest(json);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error processing webhook", e);
        }
    }

    private void processPullRequest(JsonNode json) {
        String repoName = json.path("repository").path("full_name").asText();
        Repo repo = repoRepository.findByName(repoName)
                .orElseThrow(() -> new RuntimeException("Repository not registered: " + repoName));

        JsonNode prNode = json.path("pull_request");
        Integer prNumber = prNode.path("number").asInt();
        
        PullRequest pullRequest = pullRequestRepository
                .findByRepoIdAndPrNumber(repo.getId(), prNumber)
                .orElseGet(() -> createPullRequest(repo, prNode));

        // Update PR info
        pullRequest.setTitle(prNode.path("title").asText());
        pullRequest.setDescription(prNode.path("body").asText());
        pullRequest.setAuthor(prNode.path("user").path("login").asText());
        pullRequest.setSourceBranch(prNode.path("head").path("ref").asText());
        pullRequest.setTargetBranch(prNode.path("base").path("ref").asText());
        pullRequest.setStatus(prNode.path("state").asText());
        pullRequestRepository.save(pullRequest);

        // Create and trigger a new run
        Run run = new Run();
        run.setPullRequest(pullRequest);
        run.setStatus(RunStatus.PENDING);
        run.setCommitSha(prNode.path("head").path("sha").asText());
        run.setTriggeredBy(json.path("sender").path("login").asText());
        run = runRepository.save(run);

        // Trigger async processing
        runnerService.triggerRun(run.getId());
    }

    private PullRequest createPullRequest(Repo repo, JsonNode prNode) {
        PullRequest pr = new PullRequest();
        pr.setRepo(repo);
        pr.setPrNumber(prNode.path("number").asInt());
        return pr;
    }
}
