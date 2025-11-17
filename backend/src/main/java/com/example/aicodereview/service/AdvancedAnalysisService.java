package com.example.aicodereview.service;

import com.example.aicodereview.entity.*;
import com.example.aicodereview.entity.enums.Severity;
import com.example.aicodereview.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdvancedAnalysisService {
    private static final Logger logger = LoggerFactory.getLogger(AdvancedAnalysisService.class);
    
    @Autowired
    private FindingRepository findingRepository;
    
    @Autowired
    private SuggestedPatchRepository suggestedPatchRepository;
    
    @Autowired
    private AIService aiService;
    
    // Advanced Pattern Definitions
    private static final Map<String, Pattern> SECURITY_PATTERNS = new HashMap<>();
    private static final Map<String, Pattern> PERFORMANCE_PATTERNS = new HashMap<>();
    private static final Map<String, Pattern> CODE_QUALITY_PATTERNS = new HashMap<>();
    private static final Map<String, Pattern> VULNERABILITY_PATTERNS = new HashMap<>();
    private static final Map<String, Pattern> AI_INSIGHT_PATTERNS = new HashMap<>();
    private static final Map<String, Pattern> ARCHITECTURE_PATTERNS = new HashMap<>();
    
    static {
        // Security Patterns
        SECURITY_PATTERNS.put("hardcoded_secret", 
            Pattern.compile("(?i)(password|pwd|passwd|pass|api[_-]?key|secret|token|auth|bearer)\\s*[:=]\\s*[\"'][^\"']+[\"']", Pattern.MULTILINE));
        SECURITY_PATTERNS.put("sql_injection", 
            Pattern.compile("(\"\\s*SELECT\\s+.*\\s+FROM\\s+.*\\+|'\\s*SELECT\\s+.*\\s+FROM\\s+.*\\+)", Pattern.CASE_INSENSITIVE));
        SECURITY_PATTERNS.put("xss_vulnerability", 
            Pattern.compile("(innerHTML\\s*=|outerHTML\\s*=|document\\.write\\(|eval\\(|setTimeout\\([^,]+,)", Pattern.CASE_INSENSITIVE));
        SECURITY_PATTERNS.put("weak_crypto", 
            Pattern.compile("(MD5|SHA1|DES|RC4)\\s*\\(", Pattern.CASE_INSENSITIVE));
        SECURITY_PATTERNS.put("insecure_random", 
            Pattern.compile("Math\\.random\\(\\)|Random\\(\\)", Pattern.CASE_INSENSITIVE));
        SECURITY_PATTERNS.put("command_injection", 
            Pattern.compile("(Runtime\\.exec|ProcessBuilder|exec\\(|system\\(|shell_exec)", Pattern.CASE_INSENSITIVE));
        SECURITY_PATTERNS.put("path_traversal", 
            Pattern.compile("(\\.\\./|\\.\\.\\\\ |%2e%2e|\\.\\.%2f)", Pattern.CASE_INSENSITIVE));
        SECURITY_PATTERNS.put("xxe_vulnerability", 
            Pattern.compile("(DocumentBuilderFactory|SAXParserFactory|XMLInputFactory)", Pattern.CASE_INSENSITIVE));
        
        // Performance Patterns - SIMPLIFIED to prevent stack overflow
        PERFORMANCE_PATTERNS.put("n_plus_one", 
            Pattern.compile("for\\s*\\([^)]+\\)\\s*\\{[^}]{0,500}\\.(find|query|select|get)", Pattern.CASE_INSENSITIVE));
        PERFORMANCE_PATTERNS.put("inefficient_loop", 
            Pattern.compile("for\\s*\\([^)]+\\)\\s*\\{[^}]{0,200}for\\s*\\(", Pattern.MULTILINE));
        PERFORMANCE_PATTERNS.put("synchronous_io", 
            Pattern.compile("(readFileSync|writeFileSync|readSync|writeSync)", Pattern.CASE_INSENSITIVE));
        PERFORMANCE_PATTERNS.put("memory_leak", 
            Pattern.compile("(addEventListener|setInterval|setTimeout)\\s*\\(", Pattern.CASE_INSENSITIVE));
        PERFORMANCE_PATTERNS.put("unbounded_cache", 
            Pattern.compile("(cache|Cache|CACHE)\\s*\\[.*?\\]\\s*=", Pattern.CASE_INSENSITIVE));
        PERFORMANCE_PATTERNS.put("blocking_operation", 
            Pattern.compile("(Thread\\.sleep|sleep\\(|time\\.sleep|delay\\()", Pattern.CASE_INSENSITIVE));
        
        // Code Quality Patterns - SIMPLIFIED to prevent stack overflow
        CODE_QUALITY_PATTERNS.put("god_class", 
            Pattern.compile("class\\s+\\w+", Pattern.CASE_INSENSITIVE));  // Just detect classes, check size later
        CODE_QUALITY_PATTERNS.put("long_method", 
            Pattern.compile("(function|def|public|private|protected)\\s+\\w+\\s*\\([^)]*\\)", Pattern.CASE_INSENSITIVE));
        CODE_QUALITY_PATTERNS.put("deep_nesting", 
            Pattern.compile("\\{[^{}]{0,100}\\{[^{}]{0,100}\\{[^{}]{0,100}\\{", Pattern.MULTILINE));
        CODE_QUALITY_PATTERNS.put("duplicate_code", 
            Pattern.compile("(\\w+\\s*=\\s*\\w+)", Pattern.MULTILINE));  // Simplified
        CODE_QUALITY_PATTERNS.put("magic_numbers", 
            Pattern.compile("[^\\d][3-9]\\d{2,}[^\\d]", Pattern.MULTILINE));
        CODE_QUALITY_PATTERNS.put("commented_code", 
            Pattern.compile("^\\s*//.*\\b(if|else|for|while|function|class|return|import|export)\\b", Pattern.MULTILINE));
        
        // Vulnerability Patterns - SIMPLIFIED
        VULNERABILITY_PATTERNS.put("ssrf", 
            Pattern.compile("(fetch|axios|request|http\\.get|http\\.request)\\s*\\(", Pattern.CASE_INSENSITIVE));
        VULNERABILITY_PATTERNS.put("race_condition", 
            Pattern.compile("(synchronized|lock|mutex)", Pattern.CASE_INSENSITIVE));
        VULNERABILITY_PATTERNS.put("buffer_overflow", 
            Pattern.compile("(strcpy|strcat|gets|sprintf)\\s*\\(", Pattern.CASE_INSENSITIVE));
        VULNERABILITY_PATTERNS.put("insecure_deserialization", 
            Pattern.compile("(ObjectInputStream|pickle\\.loads|unserialize|JSON\\.parse\\([^)]*\\+)", Pattern.CASE_INSENSITIVE));
        VULNERABILITY_PATTERNS.put("open_redirect", 
            Pattern.compile("(redirect|location\\.href|window\\.location)\\s*=\\s*[^;]*\\+", Pattern.CASE_INSENSITIVE));
        
        // AI Insight Patterns - Advanced ML-inspired patterns
        AI_INSIGHT_PATTERNS.put("potential_memory_optimization", 
            Pattern.compile("(new\\s+\\w+\\[\\d{4,}\\]|ArrayList\\(\\d{4,}\\)|HashMap\\(\\d{4,}\\))", Pattern.CASE_INSENSITIVE));
        AI_INSIGHT_PATTERNS.put("data_validation_missing", 
            Pattern.compile("(request\\.get|request\\.post|req\\.body|req\\.params)", Pattern.CASE_INSENSITIVE));
        AI_INSIGHT_PATTERNS.put("async_await_missing", 
            Pattern.compile("\\.then\\s*\\([^)]*\\)\\s*\\.catch", Pattern.CASE_INSENSITIVE));
        AI_INSIGHT_PATTERNS.put("resource_cleanup_missing", 
            Pattern.compile("(new\\s+(FileInputStream|FileOutputStream|Connection|Statement|ResultSet))", Pattern.CASE_INSENSITIVE));
        
        // Architecture Patterns - SIMPLIFIED
        ARCHITECTURE_PATTERNS.put("tight_coupling", 
            Pattern.compile("new\\s+\\w+\\(\\)", Pattern.CASE_INSENSITIVE));
        ARCHITECTURE_PATTERNS.put("missing_dependency_injection", 
            Pattern.compile("@Autowired|@Inject|@Resource", Pattern.CASE_INSENSITIVE));
        ARCHITECTURE_PATTERNS.put("circular_dependency_risk", 
            Pattern.compile("import\\s+[^;]+;", Pattern.CASE_INSENSITIVE));
    }
    
    public void performAdvancedAnalysis(Run run, Path workspacePath) {
        logger.info("Starting advanced analysis for run: {}", run.getId());
        
        try {
            List<Path> files = Files.walk(workspacePath)
                .filter(Files::isRegularFile)
                .filter(this::isAnalyzableFile)
                .collect(Collectors.toList());
            
            int totalIssues = 0;
            Map<String, Integer> issueCategories = new HashMap<>();
            List<Finding> allFindings = new ArrayList<>();
            
            for (Path file : files) {
                String relativePath = workspacePath.relativize(file).toString();
                logger.debug("Analyzing file: {}", relativePath);
                
                try {
                    String content = Files.readString(file);
                    List<Finding> fileFindings = analyzeFileContent(run, relativePath, content);
                    allFindings.addAll(fileFindings);
                    
                    for (Finding finding : fileFindings) {
                        issueCategories.merge(finding.getCategory(), 1, Integer::sum);
                        totalIssues++;
                    }
                } catch (IOException e) {
                    logger.error("Error reading file {}: {}", relativePath, e.getMessage());
                }
            }
            
            // Calculate metrics
            calculateAndSaveMetrics(run, totalIssues, issueCategories, allFindings);
            
            // Generate AI-powered suggestions for high-severity findings
            generateAISuggestions(allFindings);
            
            logger.info("Advanced analysis completed. Total issues found: {}", totalIssues);
            
        } catch (IOException e) {
            logger.error("Error during advanced analysis: {}", e.getMessage());
            throw new RuntimeException("Analysis failed", e);
        }
    }
    
    private List<Finding> analyzeFileContent(Run run, String filePath, String content) {
        List<Finding> findings = new ArrayList<>();
        String[] lines = content.split("\n");
        
        // Security Analysis
        for (Map.Entry<String, Pattern> entry : SECURITY_PATTERNS.entrySet()) {
            Matcher matcher = entry.getValue().matcher(content);
            while (matcher.find()) {
                int lineNumber = getLineNumber(content, matcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber, 
                    Severity.HIGH, "SECURITY",
                    getSecurityTitle(entry.getKey()),
                    getSecurityDescription(entry.getKey()),
                    lines[lineNumber - 1].trim(),
                    matcher.start(), matcher.end()
                ));
            }
        }
        
        // Performance Analysis
        for (Map.Entry<String, Pattern> entry : PERFORMANCE_PATTERNS.entrySet()) {
            Matcher matcher = entry.getValue().matcher(content);
            while (matcher.find()) {
                int lineNumber = getLineNumber(content, matcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber,
                    Severity.MEDIUM, "PERFORMANCE",
                    getPerformanceTitle(entry.getKey()),
                    getPerformanceDescription(entry.getKey()),
                    lines[lineNumber - 1].trim(),
                    matcher.start(), matcher.end()
                ));
            }
        }
        
        // Code Quality Analysis
        for (Map.Entry<String, Pattern> entry : CODE_QUALITY_PATTERNS.entrySet()) {
            Matcher matcher = entry.getValue().matcher(content);
            while (matcher.find()) {
                int lineNumber = getLineNumber(content, matcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber,
                    Severity.LOW, "CODE_QUALITY",
                    getQualityTitle(entry.getKey()),
                    getQualityDescription(entry.getKey()),
                    getCodeSnippet(lines, lineNumber - 1, 3),
                    matcher.start(), matcher.end()
                ));
            }
        }
        
        // Vulnerability Analysis
        for (Map.Entry<String, Pattern> entry : VULNERABILITY_PATTERNS.entrySet()) {
            Matcher matcher = entry.getValue().matcher(content);
            while (matcher.find()) {
                int lineNumber = getLineNumber(content, matcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber,
                    Severity.HIGH, "VULNERABILITY",
                    getVulnerabilityTitle(entry.getKey()),
                    getVulnerabilityDescription(entry.getKey()),
                    lines[lineNumber - 1].trim(),
                    matcher.start(), matcher.end()
                ));
            }
        }
        
        // Complexity Analysis
        findings.addAll(analyzeCodeComplexity(run, filePath, content, lines));
        
        // Best Practices Analysis
        findings.addAll(analyzeBestPractices(run, filePath, content, lines));
        
        // AI Insights Analysis
        findings.addAll(analyzeWithAIInsights(run, filePath, content, lines));
        
        // Architecture Analysis
        findings.addAll(analyzeArchitecture(run, filePath, content, lines));
        
        return findings;
    }
    
    private List<Finding> analyzeWithAIInsights(Run run, String filePath, String content, String[] lines) {
        List<Finding> findings = new ArrayList<>();
        
        for (Map.Entry<String, Pattern> entry : AI_INSIGHT_PATTERNS.entrySet()) {
            Matcher matcher = entry.getValue().matcher(content);
            while (matcher.find()) {
                int lineNumber = getLineNumber(content, matcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber,
                    Severity.MEDIUM, "AI_INSIGHT",
                    getAIInsightTitle(entry.getKey()),
                    getAIInsightDescription(entry.getKey()),
                    lines[Math.min(lineNumber - 1, lines.length - 1)].trim(),
                    matcher.start(), matcher.end()
                ));
            }
        }
        
        // Advanced AI-powered context analysis
        if (aiService != null) {
            try {
                List<Finding> aiFindings = aiService.analyzeCodeContext(run, filePath, content);
                findings.addAll(aiFindings);
            } catch (Exception e) {
                logger.warn("AI service analysis failed: {}", e.getMessage());
            }
        }
        
        return findings;
    }
    
    private List<Finding> analyzeArchitecture(Run run, String filePath, String content, String[] lines) {
        List<Finding> findings = new ArrayList<>();
        
        for (Map.Entry<String, Pattern> entry : ARCHITECTURE_PATTERNS.entrySet()) {
            Matcher matcher = entry.getValue().matcher(content);
            while (matcher.find()) {
                int lineNumber = getLineNumber(content, matcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber,
                    Severity.MEDIUM, "ARCHITECTURE",
                    getArchitectureTitle(entry.getKey()),
                    getArchitectureDescription(entry.getKey()),
                    lines[Math.min(lineNumber - 1, lines.length - 1)].trim(),
                    matcher.start(), matcher.end()
                ));
            }
        }
        
        return findings;
    }
    
    private List<Finding> analyzeCodeComplexity(Run run, String filePath, String content, String[] lines) {
        List<Finding> findings = new ArrayList<>();
        
        // Enhanced Cyclomatic Complexity with cognitive complexity
        int complexity = calculateCyclomaticComplexity(content);
        int cognitiveComplexity = calculateCognitiveComplexity(content);
        
        if (complexity > 10 || cognitiveComplexity > 15) {
            findings.add(createFinding(
                run, filePath, 1,
                (complexity > 20 || cognitiveComplexity > 30) ? Severity.HIGH : Severity.MEDIUM, "COMPLEXITY",
                "High Code Complexity Detected",
                String.format("Cyclomatic: %d, Cognitive: %d. Consider refactoring to reduce complexity.", complexity, cognitiveComplexity),
                "File complexity analysis",
                0, 0
            ));
        }
        
        // Method Length
        Pattern methodPattern = Pattern.compile("(function|def|public|private|protected)\\s+\\w+\\s*\\([^)]*\\)\\s*\\{([^{}]|\\{[^{}]*\\})*\\}", Pattern.DOTALL);
        Matcher methodMatcher = methodPattern.matcher(content);
        while (methodMatcher.find()) {
            String method = methodMatcher.group();
            long lineCount = method.lines().count();
            if (lineCount > 50) {
                int lineNumber = getLineNumber(content, methodMatcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber,
                    lineCount > 100 ? Severity.HIGH : Severity.MEDIUM, "COMPLEXITY",
                    "Long Method Detected",
                    String.format("This method has %d lines. Consider breaking it into smaller functions.", lineCount),
                    lines[lineNumber - 1].trim(),
                    methodMatcher.start(), methodMatcher.end()
                ));
            }
        }
        
        return findings;
    }
    
    private List<Finding> analyzeBestPractices(Run run, String filePath, String content, String[] lines) {
        List<Finding> findings = new ArrayList<>();
        
        // Check for error handling
        if (content.contains("catch") && content.contains("Exception") && !content.contains("log")) {
            findings.add(createFinding(
                run, filePath, 1,
                Severity.MEDIUM, "BEST_PRACTICE",
                "Missing Error Logging",
                "Caught exceptions should be logged for debugging purposes.",
                "catch (Exception e) { } // No logging",
                0, 0
            ));
        }
        
      
        Pattern todoPattern = Pattern.compile("//\\s*(TODO|FIXME|HACK|XXX)\\s*:?\\s*(.*)");
        Matcher todoMatcher = todoPattern.matcher(content);
        while (todoMatcher.find()) {
            int lineNumber = getLineNumber(content, todoMatcher.start());
            findings.add(createFinding(
                run, filePath, lineNumber,
                Severity.LOW, "BEST_PRACTICE",
                "Unresolved TODO Comment",
                "TODO comment found: " + todoMatcher.group(2),
                lines[lineNumber - 1].trim(),
                todoMatcher.start(), todoMatcher.end()
            ));
        }
        
        // Check for console.log in production code
        if (filePath.endsWith(".js") || filePath.endsWith(".ts")) {
            Pattern consolePattern = Pattern.compile("console\\.(log|debug|info|warn|error)");
            Matcher consoleMatcher = consolePattern.matcher(content);
            while (consoleMatcher.find()) {
                int lineNumber = getLineNumber(content, consoleMatcher.start());
                findings.add(createFinding(
                    run, filePath, lineNumber,
                    Severity.LOW, "BEST_PRACTICE",
                    "Console Statement in Production Code",
                    "Remove console statements before deploying to production.",
                    lines[lineNumber - 1].trim(),
                    consoleMatcher.start(), consoleMatcher.end()
                ));
            }
        }
        
        return findings;
    }
    
    /**
     * Creates and saves a finding entity to the database
     */
    private Finding createFinding(Run run, String filePath, int lineNumber, 
                                 Severity severity, String category, String title, 
                                 String description, String codeSnippet,
                                 int charStart, int charEnd) {
        Finding finding = new Finding();
        finding.setRun(run);
        finding.setFilePath(filePath);
        finding.setLineNumber(lineNumber);
        finding.setSeverity(severity);
        finding.setCategory(category);
        finding.setTitle(title);
        finding.setDescription(description);
        finding.setCodeSnippet(codeSnippet);
        finding.setIsResolved(false);
        return findingRepository.save(finding);
    }
    
    private void generateAISuggestions(List<Finding> findings) {
        // Group findings by severity and generate AI suggestions for HIGH severity
        List<Finding> highSeverityFindings = findings.stream()
            .filter(f -> f.getSeverity() == Severity.HIGH)
            .limit(20) // Limit to avoid too many API calls
            .collect(Collectors.toList());
        
        for (Finding finding : highSeverityFindings) {
            try {
                String suggestion = aiService.generateSuggestion(finding);
                if (suggestion != null && !suggestion.isEmpty()) {
                    SuggestedPatch patch = new SuggestedPatch();
                    patch.setFinding(finding);
                    patch.setExplanation(suggestion);
                    patch.setUnifiedDiff(""); // Set empty string instead of null
                    patch.setApplied(false);
                    suggestedPatchRepository.save(patch);
                }
            } catch (Exception e) {
                logger.error("Failed to generate AI suggestion for finding {}: {}", 
                           finding.getId(), e.getMessage());
            }
        }
    }
    
    private void calculateAndSaveMetrics(Run run, int totalIssues, 
                                        Map<String, Integer> issueCategories, 
                                        List<Finding> findings) {
        // Calculate security score (0-100)
        int securityIssues = issueCategories.getOrDefault("SECURITY", 0) + 
                            issueCategories.getOrDefault("VULNERABILITY", 0);
        int securityScore = Math.max(0, 100 - (securityIssues * 10));
        
        // Calculate quality score (0-100)
        int qualityIssues = issueCategories.getOrDefault("CODE_QUALITY", 0) + 
                           issueCategories.getOrDefault("BEST_PRACTICE", 0);
        int qualityScore = Math.max(0, 100 - (qualityIssues * 5));
        
        // Calculate performance score (0-100)
        int performanceIssues = issueCategories.getOrDefault("PERFORMANCE", 0);
        int performanceScore = Math.max(0, 100 - (performanceIssues * 8));
        
        // Log calculated metrics (can be extended by adding fields to Run entity if needed)
        logger.info("Analysis metrics - Total Issues: {}, Security Score: {}, Quality Score: {}, Performance Score: {}", 
                   totalIssues, securityScore, qualityScore, performanceScore);
    }
    
    private int calculateCyclomaticComplexity(String content) {
        int complexity = 1;
        Pattern pattern = Pattern.compile("\\b(if|else if|for|while|switch|case|catch|&&|\\|\\|)\\b");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            complexity++;
        }
        return complexity;
    }
    
    private int calculateCognitiveComplexity(String content) {
        int complexity = 0;
        // Basic cognitive complexity calculation
        Pattern ifPattern = Pattern.compile("\\b(if|else if)\\b");
        Pattern loopPattern = Pattern.compile("\\b(for|while|do)\\b");
        Pattern switchPattern = Pattern.compile("\\bswitch\\b");
        Pattern catchPattern = Pattern.compile("\\bcatch\\b");
        
        complexity += countOccurrences(ifPattern, content) * 1;
        complexity += countOccurrences(loopPattern, content) * 2;
        complexity += countOccurrences(switchPattern, content) * 1;
        complexity += countOccurrences(catchPattern, content) * 1;
        
        // Add nesting penalty
        Pattern nestedPattern = Pattern.compile("\\{[^{}]*\\{[^{}]*\\{");
        complexity += countOccurrences(nestedPattern, content) * 3;
        
        return complexity;
    }
    
    private int countOccurrences(Pattern pattern, String content) {
        int count = 0;
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            count++;
        }
        return count;
    }
    
    private int getLineNumber(String content, int charPosition) {
        return (int) content.substring(0, Math.min(charPosition, content.length()))
            .chars()
            .filter(ch -> ch == '\n')
            .count() + 1;
    }
    
    private String getCodeSnippet(String[] lines, int startLine, int contextLines) {
        StringBuilder snippet = new StringBuilder();
        int start = Math.max(0, startLine - contextLines);
        int end = Math.min(lines.length, startLine + contextLines + 1);
        
        for (int i = start; i < end; i++) {
            snippet.append(lines[i]).append("\n");
        }
        return snippet.toString();
    }
    
    private boolean isAnalyzableFile(Path file) {
        String fileName = file.getFileName().toString().toLowerCase();
        return fileName.endsWith(".java") || fileName.endsWith(".js") || 
               fileName.endsWith(".ts") || fileName.endsWith(".jsx") || 
               fileName.endsWith(".tsx") || fileName.endsWith(".py") ||
               fileName.endsWith(".go") || fileName.endsWith(".rb") ||
               fileName.endsWith(".php") || fileName.endsWith(".cs") ||
               fileName.endsWith(".cpp") || fileName.endsWith(".c") ||
               fileName.endsWith(".h") || fileName.endsWith(".swift") ||
               fileName.endsWith(".kt") || fileName.endsWith(".rs");
    }
    
    // Title and Description Getters
    private String getAIInsightTitle(String key) {
        Map<String, String> titles = Map.of(
            "potential_memory_optimization", "Potential Memory Optimization Opportunity",
            "data_validation_missing", "Missing Input Data Validation",
            "async_await_missing", "Consider Using Async/Await Pattern",
            "resource_cleanup_missing", "Missing Resource Cleanup"
        );
        return titles.getOrDefault(key, "AI Code Insight");
    }
    
    private String getAIInsightDescription(String key) {
        Map<String, String> descriptions = Map.of(
            "potential_memory_optimization", "Large data structure allocation detected. Consider lazy initialization or streaming.",
            "data_validation_missing", "User input is being used without validation. Always validate and sanitize input data.",
            "async_await_missing", "Promise-based code could be simplified using async/await for better readability.",
            "resource_cleanup_missing", "Resources are allocated but not properly closed. Use try-with-resources or ensure cleanup in finally block."
        );
        return descriptions.getOrDefault(key, "AI analysis suggests potential improvement in this code.");
    }
    
    private String getArchitectureTitle(String key) {
        Map<String, String> titles = Map.of(
            "tight_coupling", "Tight Coupling Detected",
            "missing_dependency_injection", "Consider Dependency Injection",
            "circular_dependency_risk", "Potential Circular Dependency"
        );
        return titles.getOrDefault(key, "Architecture Issue");
    }
    
    private String getArchitectureDescription(String key) {
        Map<String, String> descriptions = Map.of(
            "tight_coupling", "Multiple concrete class instantiations detected. Consider using interfaces and dependency injection.",
            "missing_dependency_injection", "Class creates its own dependencies. Use constructor or setter injection for better testability.",
            "circular_dependency_risk", "Multiple cross-imports detected. Review module dependencies to avoid circular references."
        );
        return descriptions.getOrDefault(key, "Architecture pattern issue detected.");
    }
    
    private String getSecurityTitle(String key) {
        Map<String, String> titles = Map.of(
            "hardcoded_secret", "Hardcoded Credentials Detected",
            "sql_injection", "SQL Injection Vulnerability",
            "xss_vulnerability", "Cross-Site Scripting (XSS) Vulnerability",
            "weak_crypto", "Weak Cryptography Algorithm",
            "insecure_random", "Insecure Random Number Generation",
            "command_injection", "Command Injection Vulnerability",
            "path_traversal", "Path Traversal Vulnerability",
            "xxe_vulnerability", "XML External Entity (XXE) Vulnerability"
        );
        return titles.getOrDefault(key, "Security Issue");
    }
    
    private String getSecurityDescription(String key) {
        Map<String, String> descriptions = Map.of(
            "hardcoded_secret", "Sensitive credentials should never be hardcoded. Use environment variables or secure vaults.",
            "sql_injection", "User input is being concatenated directly into SQL queries. Use parameterized queries instead.",
            "xss_vulnerability", "Unescaped user input is being rendered. This can lead to XSS attacks.",
            "weak_crypto", "Weak cryptographic algorithms are vulnerable to attacks. Use strong algorithms like SHA-256 or AES.",
            "insecure_random", "Math.random() is not cryptographically secure. Use SecureRandom or crypto.randomBytes().",
            "command_injection", "User input is being passed to system commands. Sanitize and validate all inputs.",
            "path_traversal", "Path traversal sequences detected. Validate and sanitize file paths.",
            "xxe_vulnerability", "XML processing is vulnerable to XXE attacks. Disable external entity processing."
        );
        return descriptions.getOrDefault(key, "This is a potential security vulnerability.");
    }
    
    private String getPerformanceTitle(String key) {
        Map<String, String> titles = Map.of(
            "n_plus_one", "N+1 Query Problem",
            "inefficient_loop", "Nested Loop Performance Issue",
            "synchronous_io", "Synchronous I/O Operation",
            "memory_leak", "Potential Memory Leak",
            "unbounded_cache", "Unbounded Cache Growth",
            "blocking_operation", "Blocking Operation Detected"
        );
        return titles.getOrDefault(key, "Performance Issue");
    }
    
    private String getPerformanceDescription(String key) {
        Map<String, String> descriptions = Map.of(
            "n_plus_one", "Database queries inside loops can cause N+1 problems. Use batch loading or joins.",
            "inefficient_loop", "Triple nested loops detected. Consider optimizing algorithm complexity.",
            "synchronous_io", "Synchronous I/O blocks the thread. Use asynchronous operations.",
            "memory_leak", "Event listeners or intervals without cleanup can cause memory leaks.",
            "unbounded_cache", "Cache without size limits can cause memory issues. Implement cache eviction.",
            "blocking_operation", "Blocking operations can freeze the application. Use async/await or callbacks."
        );
        return descriptions.getOrDefault(key, "This may impact application performance.");
    }
    
    private String getQualityTitle(String key) {
        Map<String, String> titles = Map.of(
            "god_class", "God Class Anti-Pattern",
            "long_method", "Long Method Detected",
            "deep_nesting", "Deep Nesting Complexity",
            "duplicate_code", "Duplicate Code Detected",
            "magic_numbers", "Magic Numbers Found",
            "commented_code", "Commented Out Code"
        );
        return titles.getOrDefault(key, "Code Quality Issue");
    }
    
    private String getQualityDescription(String key) {
        Map<String, String> descriptions = Map.of(
            "god_class", "This class is too large. Consider splitting it into smaller, focused classes.",
            "long_method", "This method is too long. Break it down into smaller, more manageable functions.",
            "deep_nesting", "Deep nesting makes code hard to read. Consider extracting methods or early returns.",
            "duplicate_code", "Duplicate code violates DRY principle. Extract common functionality.",
            "magic_numbers", "Magic numbers should be replaced with named constants.",
            "commented_code", "Remove commented out code. Version control preserves history."
        );
        return descriptions.getOrDefault(key, "This affects code maintainability.");
    }
    
    private String getVulnerabilityTitle(String key) {
        Map<String, String> titles = Map.of(
            "ssrf", "Server-Side Request Forgery (SSRF)",
            "race_condition", "Race Condition Vulnerability",
            "buffer_overflow", "Buffer Overflow Risk",
            "insecure_deserialization", "Insecure Deserialization",
            "open_redirect", "Open Redirect Vulnerability"
        );
        return titles.getOrDefault(key, "Security Vulnerability");
    }
    
    private String getVulnerabilityDescription(String key) {
        Map<String, String> descriptions = Map.of(
            "ssrf", "User-controlled URLs can lead to SSRF attacks. Validate and whitelist URLs.",
            "race_condition", "Missing proper synchronization can cause race conditions.",
            "buffer_overflow", "Unsafe string operations can cause buffer overflows. Use safe functions.",
            "insecure_deserialization", "Deserializing untrusted data is dangerous. Validate input before deserializing.",
            "open_redirect", "Unvalidated redirects can be exploited. Validate redirect destinations."
        );
        return descriptions.getOrDefault(key, "This is a critical security vulnerability.");
    }
}
