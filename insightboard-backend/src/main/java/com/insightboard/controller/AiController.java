package com.insightboard.controller;

import com.insightboard.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * Natural Language Query — "show me total sales by month"
     * Body: { question, columns: [{name, dataType}], datasetId }
     */
    @PostMapping("/nlq")
    public ResponseEntity<?> naturalLanguageQuery(@RequestBody Map<String, Object> body) {
        try {
            String question = (String) body.get("question");
            List<Map<String, String>> columns = (List<Map<String, String>>) body.get("columns");
            String datasetId = (String) body.get("datasetId");

            if (question == null || question.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question is required"));
            }
            if (columns == null || columns.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dataset columns are required"));
            }

            Map<String, Object> result = aiService.naturalLanguageQuery(question, columns, datasetId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Auto-suggest best charts for a dataset
     * Body: { columns: [{name, dataType}], sampleRows: [{...}], datasetId }
     */
    @PostMapping("/suggest")
    public ResponseEntity<?> suggestCharts(@RequestBody Map<String, Object> body) {
        try {
            List<Map<String, String>> columns = (List<Map<String, String>>) body.get("columns");
            List<Map<String, Object>> sampleRows = (List<Map<String, Object>>) body.get("sampleRows");
            String datasetId = (String) body.get("datasetId");

            if (columns == null || columns.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Dataset columns are required"));
            }

            List<Map<String, Object>> suggestions = aiService.suggestCharts(columns, sampleRows, datasetId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Generate AI summary of a dataset
     * Body: { profileData: { datasetName, totalRows, columns: [...stats] } }
     */
    @PostMapping("/summarize")
    public ResponseEntity<?> summarize(@RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> profileData = (Map<String, Object>) body.get("profileData");
            if (profileData == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Profile data is required"));
            }

            Map<String, String> result = aiService.summarizeDataset(profileData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
