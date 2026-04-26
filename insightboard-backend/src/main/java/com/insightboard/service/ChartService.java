package com.insightboard.service;

import com.insightboard.dto.ChartDataRequest;
import com.insightboard.dto.ChartDataResponse;
import com.insightboard.model.DatasetRow;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChartService {

    private final MongoTemplate mongoTemplate;

    public ChartService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public ChartDataResponse getChartData(ChartDataRequest request) {
        String xAxis = request.getXAxis();
        String yAxis = request.getYAxis();
        String aggregation = request.getAggregation();
        String datasetId = request.getDatasetId();

        // Normalize empty strings to null
        if (xAxis != null && xAxis.trim().isEmpty()) xAxis = null;
        if (yAxis != null && yAxis.trim().isEmpty()) yAxis = null;
        if (aggregation != null && aggregation.trim().isEmpty()) aggregation = null;

        if (datasetId == null || datasetId.trim().isEmpty()) {
            throw new RuntimeException("DatasetId is required");
        }

        // For KPI cards - single value aggregation (no xAxis needed)
        if ("KPI".equals(request.getChartType())) {
            return getKpiData(datasetId, yAxis, aggregation);
        }

        // For TABLE type - return raw data (no xAxis needed)
        if ("TABLE".equals(request.getChartType())) {
            return getTableData(datasetId);
        }

        // For SCATTER type - return raw X,Y coordinate pairs
        if ("SCATTER".equals(request.getChartType())) {
            if (xAxis == null || yAxis == null) {
                throw new RuntimeException("X-axis and Y-axis are required for Scatter charts");
            }
            return getScatterData(datasetId, xAxis, yAxis);
        }

        // For chart types that require xAxis
        if (xAxis == null) {
            throw new RuntimeException("X-axis is required for chart type: " + request.getChartType());
        }

        // Build MongoDB aggregation pipeline
        List<AggregationOperation> operations = new ArrayList<>();

        // Match by dataset ID
        operations.add(Aggregation.match(Criteria.where("datasetId").is(datasetId)));

        String xField = "rowData." + xAxis;
        String yField = "rowData." + yAxis;
        String groupBy = xField;

        String dateGrouping = request.getDateGrouping();
        if (dateGrouping != null && !dateGrouping.trim().isEmpty()) {
            int length = 10; // DAY: YYYY-MM-DD
            if ("YEAR".equalsIgnoreCase(dateGrouping)) length = 4; // YYYY
            else if ("MONTH".equalsIgnoreCase(dateGrouping)) length = 7; // YYYY-MM

            operations.add(Aggregation.project("rowData")
                    .and(StringOperators.Substr.valueOf(xField).substring(0, length)).as("dateGroupKey"));
            groupBy = "dateGroupKey";
        }

        GroupOperation groupOp = Aggregation.group(groupBy);

        if (yAxis != null && aggregation != null) {
            switch (aggregation.toUpperCase()) {
                case "SUM":
                    groupOp = groupOp.sum(yField).as("value");
                    break;
                case "AVG":
                    groupOp = groupOp.avg(yField).as("value");
                    break;
                case "COUNT":
                    groupOp = groupOp.count().as("value");
                    break;
                default:
                    groupOp = groupOp.sum(yField).as("value");
            }
        } else {
            groupOp = groupOp.count().as("value");
        }

        operations.add(groupOp);

        // Project to clean output
        operations.add(Aggregation.project()
                .and("_id").as("name")
                .and("value").as("value")
                .andExclude("_id"));

        // Sort by name
        operations.add(Aggregation.sort(org.springframework.data.domain.Sort.Direction.ASC, "name"));

        Aggregation agg = Aggregation.newAggregation(operations);
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> results = (AggregationResults<Map<String, Object>>) (AggregationResults<?>) mongoTemplate.aggregate(agg, "dataset_rows", Map.class);

        List<Map<String, Object>> data = new ArrayList<>();
        for (Map<String, Object> result : results.getMappedResults()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", result.get("name") != null ? result.get("name").toString() : "N/A");
            item.put("value", result.get("value") != null ? ((Number) result.get("value")).doubleValue() : 0);
            data.add(item);
        }

        String yLabel = (yAxis != null ? yAxis : "count") +
                (aggregation != null ? " (" + aggregation.toUpperCase() + ")" : "");

        return new ChartDataResponse(data, xAxis, yLabel);
    }

    private ChartDataResponse getKpiData(String datasetId, String yAxis, String aggregation) {
        List<AggregationOperation> operations = new ArrayList<>();
        operations.add(Aggregation.match(Criteria.where("datasetId").is(datasetId)));

        String yField = "rowData." + yAxis;
        GroupOperation groupOp = Aggregation.group();

        if (yAxis != null && aggregation != null) {
            switch (aggregation.toUpperCase()) {
                case "SUM":
                    groupOp = groupOp.sum(yField).as("value");
                    break;
                case "AVG":
                    groupOp = groupOp.avg(yField).as("value");
                    break;
                case "COUNT":
                    groupOp = groupOp.count().as("value");
                    break;
                default:
                    groupOp = groupOp.count().as("value");
            }
        } else {
            groupOp = groupOp.count().as("value");
        }

        operations.add(groupOp);
        Aggregation agg = Aggregation.newAggregation(operations);
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> results = (AggregationResults<Map<String, Object>>) (AggregationResults<?>) mongoTemplate.aggregate(agg, "dataset_rows", Map.class);

        Map<String, Object> item = new LinkedHashMap<>();
        if (!results.getMappedResults().isEmpty()) {
            Map<String, Object> result = results.getMappedResults().get(0);
            item.put("value", result.get("value") != null ? ((Number) result.get("value")).doubleValue() : 0);
        } else {
            item.put("value", 0);
        }
        item.put("label", (yAxis != null ? yAxis : "count") +
                (aggregation != null ? " (" + aggregation + ")" : ""));

        return new ChartDataResponse(List.of(item), null, yAxis);
    }

    private ChartDataResponse getTableData(String datasetId) {
        List<AggregationOperation> operations = new ArrayList<>();
        operations.add(Aggregation.match(Criteria.where("datasetId").is(datasetId)));
        operations.add(Aggregation.limit(200));

        Aggregation agg = Aggregation.newAggregation(operations);
        AggregationResults<DatasetRow> results = mongoTemplate.aggregate(agg, "dataset_rows", DatasetRow.class);

        List<Map<String, Object>> data = results.getMappedResults().stream()
                .map(DatasetRow::getRowData)
                .toList();

        return new ChartDataResponse(data, null, null);
    }

    private ChartDataResponse getScatterData(String datasetId, String xAxis, String yAxis) {
        List<AggregationOperation> operations = new ArrayList<>();
        operations.add(Aggregation.match(Criteria.where("datasetId").is(datasetId)));
        
        // Filter out rows where X or Y is not a number
        operations.add(Aggregation.match(Criteria.where("rowData." + xAxis).type(org.springframework.data.mongodb.core.schema.JsonSchemaObject.Type.doubleType())
                .orOperator(Criteria.where("rowData." + xAxis).type(org.springframework.data.mongodb.core.schema.JsonSchemaObject.Type.intType()))));
        operations.add(Aggregation.match(Criteria.where("rowData." + yAxis).type(org.springframework.data.mongodb.core.schema.JsonSchemaObject.Type.doubleType())
                .orOperator(Criteria.where("rowData." + yAxis).type(org.springframework.data.mongodb.core.schema.JsonSchemaObject.Type.intType()))));

        // Limit to 500 points to avoid overwhelming the frontend
        operations.add(Aggregation.limit(500));

        Aggregation agg = Aggregation.newAggregation(operations);
        AggregationResults<DatasetRow> results = mongoTemplate.aggregate(agg, "dataset_rows", DatasetRow.class);

        List<Map<String, Object>> data = new ArrayList<>();
        for (DatasetRow row : results.getMappedResults()) {
            Map<String, Object> rowData = row.getRowData();
            if (rowData.containsKey(xAxis) && rowData.containsKey(yAxis)) {
                Map<String, Object> point = new LinkedHashMap<>();
                point.put("x", ((Number) rowData.get(xAxis)).doubleValue());
                point.put("y", ((Number) rowData.get(yAxis)).doubleValue());
                data.add(point);
            }
        }

        return new ChartDataResponse(data, xAxis, yAxis);
    }
}
