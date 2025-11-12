package com.example.aicodereview.repository;

import com.example.aicodereview.entity.SuggestedPatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuggestedPatchRepository extends JpaRepository<SuggestedPatch, Long> {
    List<SuggestedPatch> findByFindingId(Long findingId);
    List<SuggestedPatch> findByApplied(Boolean applied);
}
