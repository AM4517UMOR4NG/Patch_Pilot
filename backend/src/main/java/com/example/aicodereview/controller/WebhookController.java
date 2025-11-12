package com.example.aicodereview.controller;

import com.example.aicodereview.service.WebhookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/github")
    public ResponseEntity<?> handleGithubWebhook(
            @RequestHeader("X-Hub-Signature-256") String signature,
            @RequestBody String payload) {
        
        try {
            webhookService.processGithubWebhook(payload, signature);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body("Webhook processed");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
}
