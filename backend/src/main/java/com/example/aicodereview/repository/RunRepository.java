package com.example.aicodereview.repository;

import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.enums.RunStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RunRepository extends JpaRepository<Run, Long> {
    List<Run> findByPullRequestId(Long pullRequestId);
    List<Run> findByStatus(RunStatus status);
}
