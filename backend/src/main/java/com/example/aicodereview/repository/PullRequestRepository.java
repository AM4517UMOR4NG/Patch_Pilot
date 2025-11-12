package com.example.aicodereview.repository;

import com.example.aicodereview.entity.PullRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PullRequestRepository extends JpaRepository<PullRequest, Long> {
    List<PullRequest> findByRepoId(Long repoId);
    Optional<PullRequest> findByRepoIdAndPrNumber(Long repoId, Integer prNumber);
}
