package com.example.aicodereview.service;

import com.example.aicodereview.entity.Repo;
import com.example.aicodereview.repository.RepoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class PullRequestPollingService {
    private static final Logger logger = LoggerFactory.getLogger(PullRequestPollingService.class);
    
    private final RepoRepository repoRepository;
    private final GitHubApiService gitHubApiService;
    
    @Value("${app.polling.enabled:false}")
    private boolean pollingEnabledByDefault;
    
    @Value("${app.polling.interval-minutes:30}")
    private int pollingIntervalMinutes;
    
    private final AtomicBoolean isPolling = new AtomicBoolean(false);
    private LocalDateTime lastPollTime;
    private LocalDateTime nextPollTime;
    
    public PullRequestPollingService(RepoRepository repoRepository,
                                    GitHubApiService gitHubApiService) {
        this.repoRepository = repoRepository;
        this.gitHubApiService = gitHubApiService;
    }
    
    @PostConstruct
    public void init() {
        if (pollingEnabledByDefault) {
            startPolling();
        }
    }
    
    /**
     * Start the polling process
     */
    public void startPolling() {
        if (isPolling.compareAndSet(false, true)) {
            logger.info("Polling service started with interval of {} minutes", pollingIntervalMinutes);
            updateNextPollTime();
        } else {
            logger.info("Polling service is already running");
        }
    }
    
    /**
     * Stop the polling process
     */
    public void stopPolling() {
        if (isPolling.compareAndSet(true, false)) {
            logger.info("Polling service stopped");
            nextPollTime = null;
        } else {
            logger.info("Polling service is not running");
        }
    }
    
    /**
     * Scheduled method that runs periodically to fetch pull requests
     * This runs every minute but only executes if polling is enabled
     * and the interval has passed
     */
    @Scheduled(fixedDelay = 60000) // Run every minute
    public void pollRepositories() {
        if (!isPolling.get()) {
            return;
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Check if it's time to poll
        if (nextPollTime != null && now.isBefore(nextPollTime)) {
            return;
        }
        
        logger.info("Starting scheduled poll of all repositories");
        lastPollTime = now;
        updateNextPollTime();
        
        try {
            List<Repo> repos = repoRepository.findAll();
            logger.info("Found {} repositories to poll", repos.size());
            
            for (Repo repo : repos) {
                try {
                    logger.info("Polling repository: {}", repo.getName());
                    gitHubApiService.fetchPullRequests(repo.getName());
                } catch (Exception e) {
                    logger.error("Error polling repository {}: {}", repo.getName(), e.getMessage());
                }
            }
            
            logger.info("Completed polling all repositories");
            
        } catch (Exception e) {
            logger.error("Error during repository polling: ", e);
        }
    }
    
    /**
     * Manually trigger a poll of all repositories
     */
    public void triggerManualPoll() {
        logger.info("Manual poll triggered");
        
        try {
            List<Repo> repos = repoRepository.findAll();
            
            for (Repo repo : repos) {
                try {
                    gitHubApiService.fetchPullRequests(repo.getName());
                } catch (Exception e) {
                    logger.error("Error polling repository {}: {}", repo.getName(), e.getMessage());
                }
            }
            
            lastPollTime = LocalDateTime.now();
            if (isPolling.get()) {
                updateNextPollTime();
            }
            
        } catch (Exception e) {
            logger.error("Error during manual poll: ", e);
        }
    }
    
    private void updateNextPollTime() {
        nextPollTime = LocalDateTime.now().plusMinutes(pollingIntervalMinutes);
    }
    
    // Getters for status information
    public boolean isPolling() {
        return isPolling.get();
    }
    
    public int getPollingInterval() {
        return pollingIntervalMinutes;
    }
    
    public LocalDateTime getLastPollTime() {
        return lastPollTime;
    }
    
    public LocalDateTime getNextPollTime() {
        return nextPollTime;
    }
}
