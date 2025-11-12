package com.example.aicodereview.service;

import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.enums.RunStatus;
import com.example.aicodereview.repository.RunRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class RunnerService {

    private final RunRepository runRepository;
    private final AnalysisService analysisService;

    public RunnerService(RunRepository runRepository, AnalysisService analysisService) {
        this.runRepository = runRepository;
        this.analysisService = analysisService;
    }

    @Async
    public void triggerRun(Long runId) {
        Run run = runRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Run not found"));

        try {
            // Update status to IN_PROGRESS
            run.setStatus(RunStatus.IN_PROGRESS);
            run.setStartedAt(LocalDateTime.now());
            runRepository.save(run);

            cloneRepository(run);
            
            // Run analysis
            analysisService.analyzeCode(run);
            
            // Mark as completed
            run.setStatus(RunStatus.COMPLETED);
            run.setCompletedAt(LocalDateTime.now());
            runRepository.save(run);
            
        } catch (Exception e) {
            run.setStatus(RunStatus.FAILED);
            run.setCompletedAt(LocalDateTime.now());
            run.setErrorMessage(e.getMessage());
            runRepository.save(run);
        }
    }

    private void cloneRepository(Run run) {
    
    }
}
