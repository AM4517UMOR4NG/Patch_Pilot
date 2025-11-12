package com.example.aicodereview.service;

import com.example.aicodereview.dto.FindingDto;
import com.example.aicodereview.dto.RunDto;
import com.example.aicodereview.dto.SuggestedPatchDto;
import com.example.aicodereview.entity.Run;
import com.example.aicodereview.repository.RunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RunService {

    private final RunRepository runRepository;

    public RunService(RunRepository runRepository) {
        this.runRepository = runRepository;
    }

    public List<RunDto> getRunsByPullRequest(Long pullRequestId) {
        return runRepository.findByPullRequestId(pullRequestId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RunDto getRunById(Long id) {
        Run run = runRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Run not found"));
        return convertToDto(run);
    }

    private RunDto convertToDto(Run run) {
        RunDto dto = new RunDto();
        dto.setId(run.getId());
        dto.setPullRequestId(run.getPullRequest().getId());
        dto.setStatus(run.getStatus());
        dto.setCommitSha(run.getCommitSha());
        dto.setTriggeredBy(run.getTriggeredBy());
        dto.setStartedAt(run.getStartedAt());
        dto.setCompletedAt(run.getCompletedAt());
        dto.setErrorMessage(run.getErrorMessage());
        
        if (run.getFindings() != null) {
            dto.setFindings(run.getFindings().stream()
                    .map(this::convertFindingToDto)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private FindingDto convertFindingToDto(com.example.aicodereview.entity.Finding finding) {
        FindingDto dto = new FindingDto();
        dto.setId(finding.getId());
        dto.setRunId(finding.getRun().getId());
        dto.setFilePath(finding.getFilePath());
        dto.setLineNumber(finding.getLineNumber());
        dto.setEndLineNumber(finding.getEndLineNumber());
        dto.setSeverity(finding.getSeverity());
        dto.setCategory(finding.getCategory());
        dto.setTitle(finding.getTitle());
        dto.setDescription(finding.getDescription());
        dto.setCodeSnippet(finding.getCodeSnippet());
        dto.setIsResolved(finding.getIsResolved());
        dto.setCreatedAt(finding.getCreatedAt());
        
        if (finding.getSuggestedPatches() != null) {
            dto.setSuggestedPatches(finding.getSuggestedPatches().stream()
                    .map(this::convertPatchToDto)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private SuggestedPatchDto convertPatchToDto(com.example.aicodereview.entity.SuggestedPatch patch) {
        SuggestedPatchDto dto = new SuggestedPatchDto();
        dto.setId(patch.getId());
        dto.setFindingId(patch.getFinding().getId());
        dto.setUnifiedDiff(patch.getUnifiedDiff());
        dto.setExplanation(patch.getExplanation());
        dto.setApplied(patch.getApplied());
        dto.setAppliedAt(patch.getAppliedAt());
        dto.setAppliedBy(patch.getAppliedBy());
        dto.setCreatedAt(patch.getCreatedAt());
        return dto;
    }
}
