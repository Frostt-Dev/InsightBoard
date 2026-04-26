package com.insightboard.controller;

import com.insightboard.dto.ChartDataRequest;
import com.insightboard.dto.ChartDataResponse;
import com.insightboard.model.Dashboard;
import com.insightboard.service.ChartService;
import com.insightboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final DashboardService dashboardService;
    private final ChartService chartService;

    public PublicController(DashboardService dashboardService, ChartService chartService) {
        this.dashboardService = dashboardService;
        this.chartService = chartService;
    }

    @GetMapping("/dashboards/{shareId}")
    public ResponseEntity<?> getPublicDashboard(@PathVariable String shareId) {
        try {
            Dashboard dashboard = dashboardService.getPublicDashboard(shareId);
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/charts/data")
    public ResponseEntity<?> getPublicChartData(@RequestBody ChartDataRequest request) {
        try {
            ChartDataResponse response = chartService.getChartData(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
