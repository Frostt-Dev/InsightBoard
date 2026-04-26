package com.insightboard.dto;

import java.util.List;
import java.util.Map;

public class ChartDataResponse {
    private List<Map<String, Object>> data;
    private String xAxisLabel;
    private String yAxisLabel;

    public ChartDataResponse() {}

    public ChartDataResponse(List<Map<String, Object>> data, String xAxisLabel, String yAxisLabel) {
        this.data = data;
        this.xAxisLabel = xAxisLabel;
        this.yAxisLabel = yAxisLabel;
    }

    public List<Map<String, Object>> getData() { return data; }
    public void setData(List<Map<String, Object>> data) { this.data = data; }
    public String getXAxisLabel() { return xAxisLabel; }
    public void setXAxisLabel(String xAxisLabel) { this.xAxisLabel = xAxisLabel; }
    public String getYAxisLabel() { return yAxisLabel; }
    public void setYAxisLabel(String yAxisLabel) { this.yAxisLabel = yAxisLabel; }
}
