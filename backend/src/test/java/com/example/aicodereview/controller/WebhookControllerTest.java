package com.example.aicodereview.controller;

import com.example.aicodereview.service.WebhookService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class WebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WebhookService webhookService;

    @Test
    public void testWebhookEndpointAcceptsPayload() throws Exception {
        doNothing().when(webhookService).processGithubWebhook(anyString(), anyString());
        
        String payload = "{\"action\": \"opened\", \"pull_request\": {\"number\": 1}}";
        
        mockMvc.perform(post("/webhooks/github")
                .header("X-Hub-Signature-256", "sha256=test")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isAccepted());
    }

    @Test
    public void testWebhookEndpointRejectsInvalidPayload() throws Exception {
        doNothing().when(webhookService).processGithubWebhook(anyString(), anyString());
        
        mockMvc.perform(post("/webhooks/github")
                .contentType(MediaType.APPLICATION_JSON)
                .content("invalid"))
                .andExpect(status().isBadRequest());
    }
}
