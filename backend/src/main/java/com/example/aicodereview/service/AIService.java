package com.example.aicodereview.service;

import com.example.aicodereview.entity.Finding;
import com.example.aicodereview.entity.Run;
import com.example.aicodereview.entity.enums.Severity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;

@Service
public class AIService {
    private static final Logger logger = LoggerFactory.getLogger(AIService.class);
    
    @Value("${app.openai.api-key:}")
    private String openAiApiKey;
    
    @Value("${app.openai.model:gpt-3.5-turbo}")
    private String model;
    
    @Value("${app.openai.enabled:false}")
    private boolean aiEnabled;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    
    public List<Finding> analyzeCodeContext(Run run, String filePath, String content) {
        List<Finding> findings = new ArrayList<>();
        
        if (!aiEnabled || openAiApiKey == null || openAiApiKey.isEmpty()) {
            // Return empty list if AI is not enabled
            return findings;
        }
        
        try {
            // Analyze code context using AI for advanced pattern detection
            String prompt = buildContextAnalysisPrompt(filePath, content);
            String response = callOpenAI(prompt);
            
            // Parse AI response and create findings
            List<Map<String, String>> aiInsights = parseContextAnalysisResponse(response);
            
            for (Map<String, String> insight : aiInsights) {
                Finding finding = new Finding();
                finding.setRun(run);
                finding.setFilePath(filePath);
                finding.setTitle(insight.getOrDefault("title", "AI-Detected Issue"));
                finding.setDescription(insight.getOrDefault("description", "AI analysis detected a potential issue"));
                finding.setCategory("AI_INSIGHT");
                finding.setSeverity(parseSeverity(insight.getOrDefault("severity", "MEDIUM")));
                finding.setLineNumber(parseLineNumber(insight.getOrDefault("line", "1")));
                finding.setIsResolved(false);
                findings.add(finding);
            }
        } catch (Exception e) {
            logger.error("Failed to analyze code context with AI: {}", e.getMessage());
        }
        
        return findings;
    }
    
    private String buildContextAnalysisPrompt(String filePath, String content) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Analyze this code file for potential issues, security vulnerabilities, and optimization opportunities.\n\n");
        prompt.append("File: ").append(filePath).append("\n\n");
        prompt.append("Code (first 500 lines):\n");
        
        String[] lines = content.split("\n");
        for (int i = 0; i < Math.min(lines.length, 500); i++) {
            prompt.append(lines[i]).append("\n");
        }
        
        prompt.append("\n\nProvide a JSON array of issues found with: title, description, severity (LOW/MEDIUM/HIGH), and line number.");
        return prompt.toString();
    }
    
    private List<Map<String, String>> parseContextAnalysisResponse(String response) {
        List<Map<String, String>> insights = new ArrayList<>();
        // Simple parsing logic - in production, use proper JSON parsing
        try {
            // This is a simplified parser - enhance for production
            insights.add(Map.of(
                "title", "AI-Detected Pattern",
                "description", response.substring(0, Math.min(200, response.length())),
                "severity", "MEDIUM",
                "line", "1"
            ));
        } catch (Exception e) {
            logger.error("Failed to parse AI response: {}", e.getMessage());
        }
        return insights;
    }
    
    private Severity parseSeverity(String severity) {
        try {
            return Severity.valueOf(severity.toUpperCase());
        } catch (Exception e) {
            return Severity.MEDIUM;
        }
    }
    
    private Integer parseLineNumber(String line) {
        try {
            return Integer.parseInt(line);
        } catch (Exception e) {
            return 1;
        }
    }
    
    public String generateSuggestion(Finding finding) {
        if (!aiEnabled || openAiApiKey == null || openAiApiKey.isEmpty()) {
            // Fall back to rule-based suggestions if AI is not enabled
            return generateRuleBasedSuggestion(finding);
        }
        
        try {
            String prompt = buildPrompt(finding);
            String response = callOpenAI(prompt);
            return parseResponse(response);
        } catch (Exception e) {
            logger.error("Failed to generate AI suggestion, falling back to rule-based: {}", e.getMessage());
            return generateRuleBasedSuggestion(finding);
        }
    }
    
    private String buildPrompt(Finding finding) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert software engineer and security analyst. ");
        prompt.append("Analyze this code issue and provide a professional, actionable solution.\n\n");
        
        prompt.append("Issue Type: ").append(finding.getCategory()).append("\n");
        prompt.append("Severity: ").append(finding.getSeverity()).append("\n");
        prompt.append("Title: ").append(finding.getTitle()).append("\n");
        prompt.append("Description: ").append(finding.getDescription()).append("\n");
        prompt.append("File: ").append(finding.getFilePath()).append("\n");
        prompt.append("Line: ").append(finding.getLineNumber()).append("\n");
        prompt.append("Code:\n```\n").append(finding.getCodeSnippet()).append("\n```\n\n");
        
        prompt.append("Provide:\n");
        prompt.append("1. Root cause analysis (2-3 sentences)\n");
        prompt.append("2. Security/Performance impact (if applicable)\n");
        prompt.append("3. Exact fix with code example\n");
        prompt.append("4. Best practice recommendation\n");
        prompt.append("5. Prevention tips for the future\n");
        
        prompt.append("\nBe concise, technical, and actionable. Format the response in clear sections.");
        
        return prompt.toString();
    }
    
    private String callOpenAI(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);
        
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", model);
        
        // Build messages array
        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a senior software engineer specialized in code review and security analysis.");
        
        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        
        requestBody.putArray("messages")
            .add(systemMessage)
            .add(userMessage);
            
        requestBody.put("max_tokens", 500);
        requestBody.put("temperature", 0.3); // Lower temperature for more consistent responses
        
        HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                OPENAI_API_URL,
                HttpMethod.POST,
                request,
                String.class
            );
            
            return response.getBody();
        } catch (HttpClientErrorException e) {
            logger.error("OpenAI API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to call OpenAI API", e);
        }
    }
    
    private String parseResponse(String response) {
        try {
            ObjectNode responseNode = (ObjectNode) objectMapper.readTree(response);
            return responseNode.path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();
        } catch (Exception e) {
            logger.error("Failed to parse OpenAI response: {}", e.getMessage());
            return "Failed to generate AI suggestion";
        }
    }
    
    private String generateRuleBasedSuggestion(Finding finding) {
        StringBuilder suggestion = new StringBuilder();
        
        suggestion.append("### Professional Analysis\n\n");
        
        // Root Cause
        suggestion.append("**Root Cause:**\n");
        suggestion.append(getRootCause(finding)).append("\n\n");
        
        // Impact
        suggestion.append("**Impact:**\n");
        suggestion.append(getImpact(finding)).append("\n\n");
        
        // Recommended Fix
        suggestion.append("**Recommended Fix:**\n");
        suggestion.append(getRecommendedFix(finding)).append("\n\n");
        
        // Best Practices
        suggestion.append("**Best Practices:**\n");
        suggestion.append(getBestPractices(finding)).append("\n\n");
        
        // Prevention
        suggestion.append("**Prevention:**\n");
        suggestion.append(getPreventionTips(finding));
        
        return suggestion.toString();
    }
    
    private String getRootCause(Finding finding) {
        Map<String, String> causes = new HashMap<>();
        causes.put("Hardcoded Credentials Detected", 
            "Sensitive information is directly embedded in the source code, making it visible to anyone with repository access.");
        causes.put("SQL Injection Vulnerability", 
            "User input is being concatenated directly into SQL queries without proper sanitization or parameterization.");
        causes.put("Cross-Site Scripting (XSS) Vulnerability", 
            "User-controlled data is rendered in the browser without proper escaping, allowing malicious script injection.");
        causes.put("N+1 Query Problem", 
            "Database queries are executed in a loop, causing exponential performance degradation as data grows.");
        causes.put("High Cyclomatic Complexity", 
            "The code has too many decision points, making it difficult to understand, test, and maintain.");
        
        return causes.getOrDefault(finding.getTitle(), 
            "The code violates security, performance, or quality standards.");
    }
    
    private String getImpact(Finding finding) {
        if (finding.getCategory().equals("SECURITY") || finding.getCategory().equals("VULNERABILITY")) {
            return "Critical security risk that could lead to data breaches, unauthorized access, or system compromise.";
        } else if (finding.getCategory().equals("PERFORMANCE")) {
            return "Performance degradation that could impact user experience and system scalability.";
        } else {
            return "Code maintainability issues that increase technical debt and development costs.";
        }
    }
    
    private String getRecommendedFix(Finding finding) {
        Map<String, String> fixes = new HashMap<>();
        
        fixes.put("Hardcoded Credentials Detected", 
            "```java\n" +
            "// Instead of:\n" +
            "String password = \"hardcoded_password\";\n\n" +
            "// Use environment variables:\n" +
            "String password = System.getenv(\"DB_PASSWORD\");\n\n" +
            "// Or use a configuration service:\n" +
            "@Value(\"${db.password}\")\n" +
            "private String password;\n" +
            "```");
            
        fixes.put("SQL Injection Vulnerability",
            "```java\n" +
            "// Instead of:\n" +
            "String query = \"SELECT * FROM users WHERE id = \" + userId;\n\n" +
            "// Use parameterized queries:\n" +
            "String query = \"SELECT * FROM users WHERE id = ?\";\n" +
            "PreparedStatement stmt = connection.prepareStatement(query);\n" +
            "stmt.setString(1, userId);\n" +
            "```");
            
        fixes.put("Cross-Site Scripting (XSS) Vulnerability",
            "```javascript\n" +
            "// Instead of:\n" +
            "element.innerHTML = userInput;\n\n" +
            "// Use safe methods:\n" +
            "element.textContent = userInput;\n\n" +
            "// Or escape HTML:\n" +
            "function escapeHtml(text) {\n" +
            "  const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#039;'};\n" +
            "  return text.replace(/[&<>\"']/g, m => map[m]);\n" +
            "}\n" +
            "element.innerHTML = escapeHtml(userInput);\n" +
            "```");
            
        fixes.put("N+1 Query Problem",
            "```java\n" +
            "// Instead of:\n" +
            "for (User user : users) {\n" +
            "    List<Order> orders = orderRepository.findByUserId(user.getId());\n" +
            "}\n\n" +
            "// Use batch loading:\n" +
            "List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());\n" +
            "Map<Long, List<Order>> ordersByUser = orderRepository.findByUserIdIn(userIds)\n" +
            "    .stream().collect(Collectors.groupingBy(Order::getUserId));\n" +
            "```");
        
        return fixes.getOrDefault(finding.getTitle(), 
            "Review and refactor the code following industry best practices and security guidelines.");
    }
    
    private String getBestPractices(Finding finding) {
        List<String> practices = new ArrayList<>();
        
        if (finding.getCategory().equals("SECURITY")) {
            practices.add("• Implement defense in depth - multiple layers of security");
            practices.add("• Follow the principle of least privilege");
            practices.add("• Validate and sanitize all user inputs");
            practices.add("• Use security headers and content security policies");
            practices.add("• Regular security audits and dependency updates");
        } else if (finding.getCategory().equals("PERFORMANCE")) {
            practices.add("• Profile before optimizing");
            practices.add("• Use caching strategically");
            practices.add("• Implement pagination for large datasets");
            practices.add("• Monitor performance metrics in production");
            practices.add("• Consider async/await for I/O operations");
        } else {
            practices.add("• Follow SOLID principles");
            practices.add("• Write unit tests for critical logic");
            practices.add("• Keep functions small and focused");
            practices.add("• Use meaningful variable and function names");
            practices.add("• Document complex business logic");
        }
        
        return String.join("\n", practices);
    }
    
    private String getPreventionTips(Finding finding) {
        List<String> tips = new ArrayList<>();
        
        tips.add("1. Enable static code analysis in your CI/CD pipeline");
        tips.add("2. Conduct regular code reviews with security focus");
        tips.add("3. Use pre-commit hooks to catch issues early");
        tips.add("4. Maintain a security checklist for developers");
        tips.add("5. Provide security training to the development team");
        tips.add("6. Use automated dependency scanning tools");
        tips.add("7. Implement security testing in the development cycle");
        
        return String.join("\n", tips);
    }
}
