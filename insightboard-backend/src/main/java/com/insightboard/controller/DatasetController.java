package com.insightboard.controller;

import com.insightboard.model.Dataset;
import com.insightboard.model.User;
import com.insightboard.service.DatasetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    private final DatasetService datasetService;

    public DatasetController(DatasetService datasetService) {
        this.datasetService = datasetService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDataset(@RequestParam("file") MultipartFile file,
                                            @AuthenticationPrincipal User user) {
        try {
            Dataset dataset = datasetService.uploadDataset(file, user.getId());
            return ResponseEntity.ok(dataset);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Dataset>> getUserDatasets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(datasetService.getUserDatasets(user.getId()));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<?> getDatasetPreview(@PathVariable String id) {
        try {
            return ResponseEntity.ok(datasetService.getDatasetPreview(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDataset(@PathVariable String id) {
        try {
            datasetService.deleteDataset(id);
            return ResponseEntity.ok(Map.of("message", "Dataset deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
