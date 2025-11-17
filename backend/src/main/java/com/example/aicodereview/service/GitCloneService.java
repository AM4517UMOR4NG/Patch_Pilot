package com.example.aicodereview.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class GitCloneService {
    private static final Logger logger = LoggerFactory.getLogger(GitCloneService.class);
    
    @Value("${app.workspace-dir:${java.io.tmpdir}/patch-pilot-workspace}")
    private String workspaceDir;
    
    /**
     * Clone a GitHub repository to a local workspace
     */
    public Path cloneRepository(String owner, String repo, String branch) throws Exception {
        String repoUrl = String.format("https://github.com/%s/%s.git", owner, repo);
        Path workspacePath = Paths.get(workspaceDir, owner + "_" + repo);
        
        logger.info("Cloning repository: {} to {}", repoUrl, workspacePath);
        
        // Create workspace directory
        Files.createDirectories(workspacePath.getParent());
        
        // Delete existing directory if it exists
        if (Files.exists(workspacePath)) {
            logger.info("Workspace already exists, deleting: {}", workspacePath);
            deleteDirectory(workspacePath.toFile());
        }
        
        // Clone the repository
        List<String> command = new ArrayList<>();
        command.add("git");
        command.add("clone");
        command.add("--depth");
        command.add("1");
        command.add("--branch");
        command.add(branch);
        command.add(repoUrl);
        command.add(workspacePath.toString());
        
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        
        Process process = pb.start();
        
        // Read output
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
                logger.debug("Git clone: {}", line);
            }
        }
        
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            logger.error("Git clone failed with exit code {}: {}", exitCode, output);
            throw new RuntimeException("Failed to clone repository: " + output);
        }
        
        logger.info("Successfully cloned repository to: {}", workspacePath);
        return workspacePath;
    }
    
    /**
     * Clone and checkout a specific PR branch
     */
    public Path clonePullRequest(String owner, String repo, String sourceBranch, int prNumber) throws Exception {
        try {
            // First try to clone the source branch directly
            return cloneRepository(owner, repo, sourceBranch);
        } catch (Exception e) {
            logger.warn("Failed to clone branch {}, trying default branch: {}", sourceBranch, e.getMessage());
            // Fallback to main/master branch
            try {
                return cloneRepository(owner, repo, "main");
            } catch (Exception e2) {
                logger.warn("Failed to clone main branch, trying master: {}", e2.getMessage());
                return cloneRepository(owner, repo, "master");
            }
        }
    }
    
    /**
     * Get changed files in a PR
     */
    public List<String> getChangedFiles(Path workspacePath) {
        List<String> changedFiles = new ArrayList<>();
        
        try {
            // Get all files in the workspace (excluding .git directory)
            Files.walk(workspacePath)
                .filter(Files::isRegularFile)
                .filter(p -> !p.toString().contains(".git"))
                .forEach(p -> changedFiles.add(workspacePath.relativize(p).toString()));
                
            logger.info("Found {} files in workspace", changedFiles.size());
        } catch (Exception e) {
            logger.error("Error getting changed files: {}", e.getMessage());
        }
        
        return changedFiles;
    }
    
    /**
     * Clean up workspace
     */
    public void cleanupWorkspace(Path workspacePath) {
        try {
            if (Files.exists(workspacePath)) {
                logger.info("Cleaning up workspace: {}", workspacePath);
                deleteDirectory(workspacePath.toFile());
            }
        } catch (Exception e) {
            logger.warn("Failed to cleanup workspace: {}", e.getMessage());
        }
    }
    
    private void deleteDirectory(File directory) {
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        directory.delete();
    }
}
