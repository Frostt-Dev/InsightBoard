package com.insightboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ChartDataRequest {
    private String datasetId;

    @JsonProperty("xAxis")
    private String xAxis;

    @JsonProperty("yAxis")
    private String yAxis;

    private String aggregation; // SUM, COUNT, AVG
    private String chartType;   // BAR, LINE, PIE, TABLE, KPI
    private String dateGrouping; // YEAR, QUARTER, MONTH, DAY

    public ChartDataRequest() {}

    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }
    public String getXAxis() { return xAxis; }
    public void setXAxis(String xAxis) { this.xAxis = xAxis; }
    public String getYAxis() { return yAxis; }
    public void setYAxis(String yAxis) { this.yAxis = yAxis; }
    public String getAggregation() { return aggregation; }
    public void setAggregation(String aggregation) { this.aggregation = aggregation; }
    public String getChartType() { return chartType; }
    public void setChartType(String chartType) { this.chartType = chartType; }
    public String getDateGrouping() { return dateGrouping; }
    public void setDateGrouping(String dateGrouping) { this.dateGrouping = dateGrouping; }
}
