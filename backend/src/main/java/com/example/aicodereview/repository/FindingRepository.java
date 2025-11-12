package com.example.aicodereview.repository;

import com.example.aicodereview.entity.Finding;
import com.example.aicodereview.entity.enums.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FindingRepository extends JpaRepository<Finding, Long> {
    List<Finding> findByRunId(Long runId);
    List<Finding> findBySeverity(Severity severity);
    List<Finding> findByIsResolved(Boolean isResolved);
}
