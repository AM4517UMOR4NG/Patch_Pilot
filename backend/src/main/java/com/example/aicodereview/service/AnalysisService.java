package com.example.aicodereview.service;

import com.example.aicodereview.entity.Finding;
import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.SuggestedPatch;
import com.example.aicodereview.entity.enums.Severity;
import com.example.aicodereview.repository.FindingRepository;
import com.example.aicodereview.repository.SuggestedPatchRepository;
import com.theokanning.openai.completion.chat.ChatCompletionChoice;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;


@Service
@Transactional
public class AnalysisService {
    private static final Logger logger = LoggerFactory.getLogger(AnalysisService.class);
    
    private final FindingRepository findingRepository;
    private final SuggestedPatchRepository suggestedPatchRepository;
    
    @Value("${app.openai-api-key:}")
    private String openAiApiKey;
    
    @Value("${app.analysis.max-files:50}")
    private int maxFilesToAnalyze;
    
    @Value("${app.analysis.file-extensions:.java,.js,.ts,.jsx,.tsx,.py,.go,.rs,.cpp,.c,.h,.cs}")
    private String analyzableExtensions;
    
    private OpenAiService openAiService;

    public AnalysisService(FindingRepository findingRepository, 
                          SuggestedPatchRepository suggestedPatchRepository) {
        this.findingRepository = findingRepository;
        this.suggestedPatchRepository = suggestedPatchRepository;
    }

    public void analyzeCode(Run run, Path repoPath) {
        logger.info("Starting code analysis for run {} at path {}", run.getId(), repoPath);
        
        try {
            // Collect files to analyze
            List<Path> filesToAnalyze = collectFilesToAnalyze(repoPath);
            
            if (filesToAnalyze.isEmpty()) {
                logger.warn("No files found to analyze");
                createNoFilesFoundFinding(run);
                return;
            }
            
            logger.info("Found {} files to analyze", filesToAnalyze.size());
            
            // Analyze each file
            for (Path file : filesToAnalyze) {
                try {
                    analyzeFile(run, repoPath, file);
                } catch (Exception e) {
                    logger.error("Error analyzing file {}: {}", file, e.getMessage());
                }
            }
            
            // If no findings were created, create a success finding
            if (findingRepository.findByRunId(run.getId()).isEmpty()) {
                createNoIssuesFinding(run);
            }
            
        } catch (Exception e) {
            logger.error("Error during code analysis: ", e);
            createErrorFinding(run, e.getMessage());
        }
    }

    private List<Path> collectFilesToAnalyze(Path repoPath) throws IOException {
        List<Path> files = new ArrayList<>();
        Set<String> extensions = new HashSet<>(Arrays.asList(analyzableExtensions.split(",")));
        
        Files.walkFileTree(repoPath, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                String fileName = file.getFileName().toString();
                String extension = fileName.contains(".") ? 
                    fileName.substring(fileName.lastIndexOf(".")) : "";
                
                // Skip hidden files, node_modules, vendor, etc.
                String pathStr = file.toString();
                if (pathStr.contains("node_modules") || 
                    pathStr.contains(".git") ||
                    pathStr.contains("vendor") ||
                    pathStr.contains("target") ||
                    pathStr.contains("build") ||
                    pathStr.contains("dist")) {
                    return FileVisitResult.CONTINUE;
                }
                
                if (extensions.contains(extension) && files.size() < maxFilesToAnalyze) {
                    files.add(file);
                }
                
                return FileVisitResult.CONTINUE;
            }
        });
        
        return files;
    }
    
    private void analyzeFile(Run run, Path repoPath, Path file) throws IOException {
        String content = Files.readString(file);
        String relativePath = repoPath.relativize(file).toString().replace("\\", "/");
        
        logger.debug("Analyzing file: {}", relativePath);
        
        // Perform basic static analysis
        performStaticAnalysis(run, relativePath, content);
        
        // If OpenAI is configured, perform AI analysis
        if (openAiApiKey != null && !openAiApiKey.isEmpty()) {
            performAiAnalysis(run, relativePath, content);
        }
    }
    
    private void performStaticAnalysis(Run run, String filePath, String content) {
        String[] lines = content.split("\n");
        
        // Check for common issues
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            int lineNumber = i + 1;
            
            // Check for hardcoded credentials
            if (containsHardcodedCredentials(line)) {
                createFinding(run, filePath, lineNumber, lineNumber,
                    Severity.HIGH, "Security",
                    "Potential hardcoded credentials",
                    "Line contains what appears to be hardcoded credentials",
                    line.trim());
            }
            
            // Check for SQL injection vulnerabilities
            if (containsSqlInjectionRisk(line)) {
                createFinding(run, filePath, lineNumber, lineNumber,
                    Severity.HIGH, "Security",
                    "Potential SQL injection vulnerability",
                    "SQL query appears to use string concatenation instead of prepared statements",
                    line.trim());
            }
            
            
            if (line.contains("TODO") || line.contains("FIXME") || line.contains("HACK")) {
                createFinding(run, filePath, lineNumber, lineNumber,
                    Severity.LOW, "Code Quality",
                    "Unresolved TODO/FIXME comment",
                    "Code contains unresolved TODO, FIXME, or HACK comment",
                    line.trim());
            }
            
            // Check for console.log in production code
            if (line.contains("console.log") && !filePath.contains("test")) {
                createFinding(run, filePath, lineNumber, lineNumber,
                    Severity.LOW, "Code Quality",
                    "Console log in production code",
                    "Remove console.log statements from production code",
                    line.trim());
            }
            
            // Check for empty catch blocks
            if (line.trim().equals("} catch (") || 
                (line.contains("catch") && lines.length > i + 1 && lines[i + 1].trim().equals("}"))) {
                createFinding(run, filePath, lineNumber, lineNumber + 1,
                    Severity.MEDIUM, "Error Handling",
                    "Empty catch block",
                    "Empty catch blocks can hide errors and make debugging difficult",
                    line.trim());
            }
        }
    }
    
    private boolean containsHardcodedCredentials(String line) {
        String lowerLine = line.toLowerCase();
        return (lowerLine.contains("password") || 
                lowerLine.contains("secret") || 
                lowerLine.contains("api_key") ||
                lowerLine.contains("apikey")) &&
               (line.contains("=") || line.contains(":")) &&
               line.contains("\"") &&
               !line.contains("env") &&
               !line.contains("process.env") &&
               !line.contains("${")
                                           ;
    }
    
    private boolean containsSqlInjectionRisk(String line) {
        String lowerLine = line.toLowerCase();
        return (lowerLine.contains("select ") || 
                lowerLine.contains("insert ") ||
                lowerLine.contains("update ") ||
                lowerLine.contains("delete ")) &&
               (line.contains(" + ") || line.contains(" +\"")); 
    }
    
    private void performAiAnalysis(Run run, String filePath, String content) {
        if (openAiService == null) {
            try {
                openAiService = new OpenAiService(openAiApiKey);
            } catch (Exception e) {
                logger.error("Failed to initialize OpenAI service: {}", e.getMessage());
                return;
            }
        }
        
        try {
            String prompt = String.format(
                "Analyze this code for potential bugs, security vulnerabilities, and code quality issues. " +
                "Provide specific findings with line numbers where applicable.\n\n" +
                "File: %s\n\n" +
                "Code:\n%s\n\n" +
                "Format your response as a JSON array of findings, each with: " +
                "lineNumber, severity (LOW/MEDIUM/HIGH), category, title, description",
                filePath, content.substring(0, Math.min(content.length(), 3000)) // Limit content size
            );
            
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(Arrays.asList(
                    new ChatMessage(ChatMessageRole.SYSTEM.value(), 
                        "You are a code review assistant. Analyze code for issues and provide specific, actionable feedback."),
                    new ChatMessage(ChatMessageRole.USER.value(), prompt)
                ))
                .maxTokens(1000)
                .temperature(0.3)
                .build();
            
            List<ChatCompletionChoice> choices = openAiService.createChatCompletion(request).getChoices();
            
            if (!choices.isEmpty()) {
                String response = choices.get(0).getMessage().getContent();
                parseAiFindings(run, filePath, content, response);
            }
            
        } catch (Exception e) {
            logger.error("AI analysis failed for file {}: {}", filePath, e.getMessage());
        }
    }
    
    private void parseAiFindings(Run run, String filePath, String content, String aiResponse) {
        // Simple parsing - in production, use proper JSON parsing
        String[] lines = aiResponse.split("\n");
        for (String line : lines) {
            if (line.contains("lineNumber") || line.contains("line")) {
                // Extract finding details from AI response
                // This is simplified - in production, parse JSON properly
                createFinding(run, filePath, 1, 1,
                    Severity.MEDIUM, "AI Analysis",
                    "AI-detected issue",
                    line.trim(),
                    "");
            }
        }
    }
    
    private void createFinding(Run run, String filePath, int startLine, int endLine,
                               Severity severity, String category, String title,
                               String description, String codeSnippet) {
        Finding finding = new Finding();
        finding.setRun(run);
        finding.setFilePath(filePath);
        finding.setLineNumber(startLine);
        finding.setEndLineNumber(endLine);
        finding.setSeverity(severity);
        finding.setCategory(category);
        finding.setTitle(title);
        finding.setDescription(description);
        finding.setCodeSnippet(codeSnippet);
        findingRepository.save(finding);
        
        // Generate a suggested patch if applicable
        if (severity == Severity.HIGH && category.equals("Security")) {
            generateSuggestedPatch(finding);
        }
    }
    
    private void generateSuggestedPatch(Finding finding) {
        // Generate context-aware patches
        String patch = "";
        String explanation = "";
        
        if (finding.getTitle().contains("SQL injection")) {
            patch = "Use prepared statements instead of string concatenation";
            explanation = "Replace string concatenation with parameterized queries to prevent SQL injection";
        } else if (finding.getTitle().contains("hardcoded credentials")) {
            patch = "Move credentials to environment variables or secure configuration";
            explanation = "Never hardcode credentials in source code. Use environment variables or secure vaults";
        }
        
        if (!patch.isEmpty()) {
            SuggestedPatch suggestedPatch = new SuggestedPatch();
            suggestedPatch.setFinding(finding);
            suggestedPatch.setUnifiedDiff(patch);
            suggestedPatch.setExplanation(explanation);
            suggestedPatchRepository.save(suggestedPatch);
        }
    }
    
    private void createNoFilesFoundFinding(Run run) {
        Finding finding = new Finding();
        finding.setRun(run);
        finding.setFilePath("N/A");
        finding.setLineNumber(0);
        finding.setEndLineNumber(0);
        finding.setSeverity(Severity.LOW);
        finding.setCategory("Information");
        finding.setTitle("No files found to analyze");
        finding.setDescription("No source code files were found in the repository for analysis");
        finding.setCodeSnippet("");
        findingRepository.save(finding);
    }
    
    private void createNoIssuesFinding(Run run) {
        Finding finding = new Finding();
        finding.setRun(run);
        finding.setFilePath("N/A");
        finding.setLineNumber(0);
        finding.setEndLineNumber(0);
        finding.setSeverity(Severity.LOW);
        finding.setCategory("Success");
        finding.setTitle("No issues found");
        finding.setDescription("Code analysis completed successfully with no issues detected");
        finding.setCodeSnippet("");
        findingRepository.save(finding);
    }
    
    private void createErrorFinding(Run run, String errorMessage) {
        Finding finding = new Finding();
        finding.setRun(run);
        finding.setFilePath("N/A");
        finding.setLineNumber(0);
        finding.setEndLineNumber(0);
        finding.setSeverity(Severity.HIGH);
        finding.setCategory("Error");
        finding.setTitle("Analysis error");
        finding.setDescription("An error occurred during analysis: " + errorMessage);
        finding.setCodeSnippet("");
        findingRepository.save(finding);
    }
}
