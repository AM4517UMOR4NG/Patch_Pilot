package com.example.aicodereview.service;

import com.example.aicodereview.entity.Comment;
import com.example.aicodereview.entity.PullRequest;
import com.example.aicodereview.entity.SuggestedPatch;
import com.example.aicodereview.repository.CommentRepository;
import com.example.aicodereview.repository.PullRequestRepository;
import com.example.aicodereview.repository.SuggestedPatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class PatchService {

    private final SuggestedPatchRepository suggestedPatchRepository;
    private final PullRequestRepository pullRequestRepository;
    private final CommentRepository commentRepository;

    public PatchService(SuggestedPatchRepository suggestedPatchRepository,
                       PullRequestRepository pullRequestRepository,
                       CommentRepository commentRepository) {
        this.suggestedPatchRepository = suggestedPatchRepository;
        this.pullRequestRepository = pullRequestRepository;
        this.commentRepository = commentRepository;
    }

    public void applyPatch(Long pullRequestId, Long patchId, String appliedBy) {
        PullRequest pullRequest = pullRequestRepository.findById(pullRequestId)
                .orElseThrow(() -> new RuntimeException("Pull request not found"));
        
        SuggestedPatch patch = suggestedPatchRepository.findById(patchId)
                .orElseThrow(() -> new RuntimeException("Patch not found"));
        
        if (patch.getApplied()) {
            throw new RuntimeException("Patch already applied");
        }
        
        // TODO: Implement actual patch application via GitHub API
        // This should:
        // 1. Apply the patch to the PR branch
        // 2. Commit with appropriate message
        // 3. Update PR via GitHub API
        // For now, we just mark it as applied
        
        patch.setApplied(true);
        patch.setAppliedAt(LocalDateTime.now());
        patch.setAppliedBy(appliedBy);
        suggestedPatchRepository.save(patch);
        
        // Create a comment for the applied patch
        Comment comment = new Comment();
        comment.setPullRequest(pullRequest);
        comment.setBody("Applied patch for finding: " + patch.getFinding().getTitle() + 
                        "\n\n" + patch.getExplanation());
        comment.setAuthor(appliedBy);
        comment.setApplied(true);
        commentRepository.save(comment);
    }
}
