package com.insightboard.service;

import com.insightboard.model.Dashboard;
import com.insightboard.repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    public Dashboard createDashboard(String name, String userId) {
        Dashboard dashboard = new Dashboard();
        dashboard.setName(name);
        dashboard.setUserId(userId);
        dashboard.setShareId(UUID.randomUUID().toString());
        return dashboardRepository.save(dashboard);
    }

    public List<Dashboard> getUserDashboards(String userId) {
        return dashboardRepository.findByUserId(userId);
    }

    public Dashboard getDashboard(String dashboardId) {
        return dashboardRepository.findById(dashboardId)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
    }

    public Dashboard updateDashboard(String dashboardId, Dashboard updates) {
        Dashboard dashboard = getDashboard(dashboardId);
        if (updates.getName() != null) {
            dashboard.setName(updates.getName());
        }
        if (updates.getWidgets() != null) {
            dashboard.setWidgets(updates.getWidgets());
        }
        dashboard.setUpdatedAt(LocalDateTime.now());
        return dashboardRepository.save(dashboard);
    }

    public Dashboard togglePublicSharing(String dashboardId) {
        Dashboard dashboard = getDashboard(dashboardId);
        dashboard.setPublic(!dashboard.isPublic());
        dashboard.setUpdatedAt(LocalDateTime.now());
        return dashboardRepository.save(dashboard);
    }

    public Dashboard getPublicDashboard(String shareId) {
        Dashboard dashboard = dashboardRepository.findByShareId(shareId)
                .orElseThrow(() -> new RuntimeException("Dashboard not found"));
        if (!dashboard.isPublic()) {
            throw new RuntimeException("This dashboard is not shared publicly");
        }
        return dashboard;
    }

    public void deleteDashboard(String dashboardId) {
        dashboardRepository.deleteById(dashboardId);
    }

    public Dashboard duplicateDashboard(String dashboardId, String userId) {
        Dashboard original = getDashboard(dashboardId);
        Dashboard copy = new Dashboard();
        copy.setName(original.getName() + " (Copy)");
        copy.setUserId(userId);
        copy.setShareId(UUID.randomUUID().toString());
        copy.setPublic(false);
        copy.setWidgets(original.getWidgets());
        return dashboardRepository.save(copy);
    }
}

