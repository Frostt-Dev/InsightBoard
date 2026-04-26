package com.insightboard.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String callGemini(String prompt) {
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
        );

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentObj = Map.of("parts", List.of(textPart));
        Map<String, Object> body = Map.of(
                "contents", List.of(contentObj),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 1024
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.POST, entity, JsonNode.class);
            JsonNode responseBody = response.getBody();

            if (responseBody != null
                    && responseBody.has("candidates")
                    && responseBody.get("candidates").size() > 0) {
                JsonNode content = responseBody.get("candidates").get(0).get("content");
                if (content != null && content.has("parts") && content.get("parts").size() > 0) {
                    return content.get("parts").get(0).get("text").asText();
                }
            }
            return "{}";
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 429) {
                throw new RuntimeException("Gemini API quota exceeded. Please wait a minute and try again, or check your API key at https://aistudio.google.com/app/apikey");
            }
            throw new RuntimeException("Gemini API error (" + e.getStatusCode().value() + "): " + e.getStatusText());
        }
    }

    /**
     * Natural Language Query — parse user question + dataset schema into a chart config
     */
    public Map<String, Object> naturalLanguageQuery(String question, List<Map<String, String>> columns, String datasetId) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a data visualization assistant for a dashboard tool called InsightBoard.\n");
        prompt.append("The user has a dataset with these columns:\n");
        for (Map<String, String> col : columns) {
            prompt.append("- ").append(col.get("name")).append(" (").append(col.get("dataType")).append(")\n");
        }
        prompt.append("\nThe user asked: \"").append(question).append("\"\n\n");
        prompt.append("Based on this, decide the best chart configuration. Choose from these chart types: BAR, LINE, PIE, DONUT, AREA, SCATTER, WATERFALL, GAUGE, FUNNEL, HEATMAP, TABLE, KPI.\n");
        prompt.append("Return ONLY a valid JSON object (no markdown, no code fences) with these fields:\n");
        prompt.append("{\n");
        prompt.append("  \"widgetType\": \"<chart type>\",\n");
        prompt.append("  \"title\": \"<descriptive title for the widget>\",\n");
        prompt.append("  \"xAxis\": \"<column name for X-axis or category, use exact column name>\",\n");
        prompt.append("  \"yAxis\": \"<column name for Y-axis or value, use exact column name>\",\n");
        prompt.append("  \"aggregation\": \"<SUM or AVG or COUNT>\",\n");
        prompt.append("  \"explanation\": \"<short 1-sentence explanation of why this chart was chosen>\"\n");
        prompt.append("}\n");

        try {
            String raw = callGemini(prompt.toString());
            // Strip markdown code fences if Gemini adds them
            raw = raw.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            Map<String, Object> result = objectMapper.readValue(raw, Map.class);
            result.put("datasetId", datasetId);
            return result;
        } catch (Exception e) {
            return Map.of("error", "Failed to parse AI response: " + e.getMessage(), "raw", e.getMessage());
        }
    }

    /**
     * Auto-suggest — recommend the best 3 charts for a dataset
     */
    public List<Map<String, Object>> suggestCharts(List<Map<String, String>> columns, List<Map<String, Object>> sampleRows, String datasetId) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a data visualization expert.\n");
        prompt.append("Given this dataset schema:\n");
        for (Map<String, String> col : columns) {
            prompt.append("- ").append(col.get("name")).append(" (").append(col.get("dataType")).append(")\n");
        }
        if (sampleRows != null && !sampleRows.isEmpty()) {
            prompt.append("\nHere are the first ").append(Math.min(5, sampleRows.size())).append(" rows of data:\n");
            for (int i = 0; i < Math.min(5, sampleRows.size()); i++) {
                prompt.append(sampleRows.get(i).toString()).append("\n");
            }
        }
        prompt.append("\nSuggest the 3-6 most insightful chart configurations based on the dataset's complexity. Chart types available: BAR, LINE, PIE, DONUT, AREA, SCATTER, WATERFALL, GAUGE, FUNNEL, HEATMAP, TABLE, KPI.\n");
        prompt.append("Return ONLY a valid JSON array (no markdown, no code fences) of objects with these fields:\n");
        prompt.append("[{\n");
        prompt.append("  \"widgetType\": \"<chart type>\",\n");
        prompt.append("  \"title\": \"<descriptive title>\",\n");
        prompt.append("  \"xAxis\": \"<exact column name>\",\n");
        prompt.append("  \"yAxis\": \"<exact column name>\",\n");
        prompt.append("  \"aggregation\": \"<SUM or AVG or COUNT>\",\n");
        prompt.append("  \"explanation\": \"<why this visualization is useful>\"\n");
        prompt.append("}]\n");

        try {
            String raw = callGemini(prompt.toString());
            raw = raw.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            List<Map<String, Object>> suggestions = objectMapper.readValue(raw, List.class);
            for (Map<String, Object> s : suggestions) {
                s.put("datasetId", datasetId);
            }
            return suggestions;
        } catch (Exception e) {
            return List.of(Map.of("error", "Failed to parse AI response: " + e.getMessage()));
        }
    }

    /**
     * Data summary — generate a human-readable paragraph
     */
    public Map<String, String> summarizeDataset(Map<String, Object> profileData) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a data analyst. Given the following statistical profile of a dataset, write a concise, professional 3-4 sentence analytical summary.\n");
        prompt.append("Focus on key insights, data quality, notable patterns, and what the data could be used for.\n");
        prompt.append("Do NOT use markdown formatting. Write plain text only.\n\n");
        prompt.append("Dataset profile:\n");
        prompt.append(profileData.toString()).append("\n");

        try {
            String summary = callGemini(prompt.toString());
            return Map.of("summary", summary.trim());
        } catch (Exception e) {
            return Map.of("error", "Failed to generate summary: " + e.getMessage());
        }
    }
}
