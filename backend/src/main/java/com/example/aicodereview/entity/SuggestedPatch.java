package com.example.aicodereview.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "suggested_patches")
@Data
@EqualsAndHashCode(exclude = {"finding"})
@ToString(exclude = {"finding"})
public class SuggestedPatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finding_id", nullable = false)
    private Finding finding;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String unifiedDiff;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    private Boolean applied;
    private LocalDateTime appliedAt;
    private String appliedBy;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (applied == null) {
            applied = false;
        }
    }
}
