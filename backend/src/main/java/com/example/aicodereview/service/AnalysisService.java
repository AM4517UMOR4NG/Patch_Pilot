package com.example.aicodereview.service;

import com.example.aicodereview.entity.Finding;
import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.SuggestedPatch;
import com.example.aicodereview.entity.enums.Severity;
import com.example.aicodereview.repository.FindingRepository;
import com.example.aicodereview.repository.SuggestedPatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class AnalysisService {

    private final FindingRepository findingRepository;
    private final SuggestedPatchRepository suggestedPatchRepository;

    public AnalysisService(FindingRepository findingRepository, 
                          SuggestedPatchRepository suggestedPatchRepository) {
        this.findingRepository = findingRepository;
        this.suggestedPatchRepository = suggestedPatchRepository;
    }

    public void analyzeCode(Run run) {

        createSampleFindings(run);
    }

    private void createSampleFindings(Run run) {
        // Create a sample finding for demonstration
        Finding finding = new Finding();
        finding.setRun(run);
        finding.setFilePath("src/main/java/Example.java");
        finding.setLineNumber(42);
        finding.setEndLineNumber(45);
        finding.setSeverity(Severity.MEDIUM);
        finding.setCategory("Code Quality");
        finding.setTitle("Potential null pointer dereference");
        finding.setDescription("Variable 'result' may be null when accessed");
        finding.setCodeSnippet("String value = result.toString(); // result may be null");
        finding = findingRepository.save(finding);

        // Create a suggested patch
        SuggestedPatch patch = new SuggestedPatch();
        patch.setFinding(finding);
        patch.setUnifiedDiff(generateSampleDiff());
        patch.setExplanation("Add null check before accessing result");
        suggestedPatchRepository.save(patch);
    }

    private String generateSampleDiff() {
        return """
            --- a/src/main/java/Example.java
            +++ b/src/main/java/Example.java
            @@ -42,1 +42,4 @@
            -String value = result.toString();
            +String value = null;
            +if (result != null) {
            +    value = result.toString();
            +}
            """;
    }
}
