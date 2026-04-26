package com.insightboard.controller;

import com.insightboard.model.Dashboard;
import com.insightboard.model.User;
import com.insightboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboards")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PostMapping
    public ResponseEntity<?> createDashboard(@RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal User user) {
        try {
            String name = body.getOrDefault("name", "Untitled Dashboard");
            Dashboard dashboard = dashboardService.createDashboard(name, user.getId());
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Dashboard>> getUserDashboards(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getUserDashboards(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDashboard(@PathVariable String id) {
        try {
            return ResponseEntity.ok(dashboardService.getDashboard(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDashboard(@PathVariable String id, @RequestBody Dashboard updates) {
        try {
            return ResponseEntity.ok(dashboardService.updateDashboard(id, updates));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> toggleSharing(@PathVariable String id) {
        try {
            return ResponseEntity.ok(dashboardService.togglePublicSharing(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicateDashboard(@PathVariable String id,
                                                @AuthenticationPrincipal User user) {
        try {
            return ResponseEntity.ok(dashboardService.duplicateDashboard(id, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDashboard(@PathVariable String id) {
        try {
            dashboardService.deleteDashboard(id);
            return ResponseEntity.ok(Map.of("message", "Dashboard deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
