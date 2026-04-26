package com.insightboard.model;

import java.util.Map;

public class DashboardWidget {
    private String widgetId;
    private String widgetType; // BAR, LINE, PIE, TABLE, KPI
    private Map<String, Object> config;
    private Map<String, Object> position; // x, y, w, h for grid layout

    public DashboardWidget() {}

    public String getWidgetId() { return widgetId; }
    public void setWidgetId(String widgetId) { this.widgetId = widgetId; }
    public String getWidgetType() { return widgetType; }
    public void setWidgetType(String widgetType) { this.widgetType = widgetType; }
    public Map<String, Object> getConfig() { return config; }
    public void setConfig(Map<String, Object> config) { this.config = config; }
    public Map<String, Object> getPosition() { return position; }
    public void setPosition(Map<String, Object> position) { this.position = position; }
}
