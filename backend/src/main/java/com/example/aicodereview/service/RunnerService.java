package com.example.aicodereview.service;

import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.enums.RunStatus;
import com.example.aicodereview.repository.RunRepository;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.commons.io.FileUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;

@Service
@Transactional
public class RunnerService {
    private static final Logger logger = LoggerFactory.getLogger(RunnerService.class);

    private final RunRepository runRepository;
    private final AnalysisService analysisService;
    
    @Value("${app.github-token:}")
    private String githubToken;
    
    @Value("${app.workspace-dir:${java.io.tmpdir}/patch-pilot-workspace}")
    private String workspaceDir;

    public RunnerService(RunRepository runRepository, AnalysisService analysisService) {
        this.runRepository = runRepository;
        this.analysisService = analysisService;
    }

    @Async
    public void triggerRun(Long runId) {
        Run run = runRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Run not found"));

        Path repoPath = null;
        
        try {
            // Update status to IN_PROGRESS
            run.setStatus(RunStatus.IN_PROGRESS);
            run.setStartedAt(LocalDateTime.now());
            runRepository.save(run);

            // Clone the repository
            repoPath = cloneRepository(run);
            
            // Run analysis with the cloned repo path
            analysisService.analyzeCode(run, repoPath);
            
            // Mark as completed
            run.setStatus(RunStatus.COMPLETED);
            run.setCompletedAt(LocalDateTime.now());
            runRepository.save(run);
            
        } catch (Exception e) {
            logger.error("Error during run execution: ", e);
            run.setStatus(RunStatus.FAILED);
            run.setCompletedAt(LocalDateTime.now());
            run.setErrorMessage(e.getMessage());
            runRepository.save(run);
        } finally {
            // Clean up the cloned repository
            if (repoPath != null) {
                try {
                    FileUtils.deleteDirectory(repoPath.toFile());
                    logger.info("Cleaned up repository at: {}", repoPath);
                } catch (IOException e) {
                    logger.warn("Failed to clean up repository: {}", e.getMessage());
                }
            }
        }
    }

    private Path cloneRepository(Run run) throws GitAPIException, IOException {
        String cloneUrl = run.getPullRequest().getRepo().getCloneUrl();
        String commitSha = run.getCommitSha();
        
        // Create a unique directory for this run
        Path workDir = Path.of(workspaceDir);
        Files.createDirectories(workDir);
        
        Path repoPath = workDir.resolve("run-" + run.getId());
        
        // Delete if exists
        if (Files.exists(repoPath)) {
            FileUtils.deleteDirectory(repoPath.toFile());
        }
        
        logger.info("Cloning repository {} to {}", cloneUrl, repoPath);
        
        // Clone the repository
        var cloneCommand = Git.cloneRepository()
                .setURI(cloneUrl)
                .setDirectory(repoPath.toFile())
                .setCloneAllBranches(false);
        
        // Add authentication if token is available
        if (githubToken != null && !githubToken.isEmpty()) {
            cloneCommand.setCredentialsProvider(
                new UsernamePasswordCredentialsProvider(githubToken, "")
            );
        }
        
        try (Git git = cloneCommand.call()) {
            // Checkout the specific commit
            if (commitSha != null && !commitSha.isEmpty()) {
                git.checkout()
                    .setName(commitSha)
                    .call();
                logger.info("Checked out commit: {}", commitSha);
            }
            
            // Fetch the PR branch
            String prBranch = run.getPullRequest().getSourceBranch();
            if (prBranch != null && !prBranch.isEmpty()) {
                try {
                    git.fetch()
                        .setRemote("origin")
                        .setRefSpecs("refs/heads/" + prBranch + ":refs/remotes/origin/" + prBranch)
                        .call();
                    
                    git.checkout()
                        .setName("origin/" + prBranch)
                        .call();
                    
                    logger.info("Checked out PR branch: {}", prBranch);
                } catch (Exception e) {
                    logger.warn("Could not checkout PR branch, using commit SHA: {}", e.getMessage());
                }
            }
        }
        
        logger.info("Repository cloned successfully to: {}", repoPath);
        return repoPath;
    }
}
