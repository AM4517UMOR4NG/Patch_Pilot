package com.example.aicodereview.entity;

import com.example.aicodereview.entity.enums.Severity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "findings")
@Data
@EqualsAndHashCode(exclude = {"run", "suggestedPatches"})
@ToString(exclude = {"run", "suggestedPatches"})
public class Finding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false)
    private Run run;

    @Column(nullable = false)
    private String filePath;

    private Integer lineNumber;
    private Integer endLineNumber;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Severity severity;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String codeSnippet;

    private Boolean isResolved;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "finding", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SuggestedPatch> suggestedPatches = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isResolved == null) {
            isResolved = false;
        }
    }
}
