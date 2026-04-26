package com.insightboard.controller;

import com.insightboard.dto.ChartDataRequest;
import com.insightboard.dto.ChartDataResponse;
import com.insightboard.service.ChartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/charts")
public class ChartController {

    private final ChartService chartService;

    public ChartController(ChartService chartService) {
        this.chartService = chartService;
    }

    @PostMapping("/data")
    public ResponseEntity<?> getChartData(@RequestBody ChartDataRequest request) {
        try {
            ChartDataResponse response = chartService.getChartData(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
