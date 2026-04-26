package com.insightboard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Map;

@Document(collection = "dataset_rows")
public class DatasetRow {
    @Id
    private String id;
    private String datasetId;
    private Map<String, Object> rowData;

    public DatasetRow() {}

    public DatasetRow(String datasetId, Map<String, Object> rowData) {
        this.datasetId = datasetId;
        this.rowData = rowData;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDatasetId() { return datasetId; }
    public void setDatasetId(String datasetId) { this.datasetId = datasetId; }
    public Map<String, Object> getRowData() { return rowData; }
    public void setRowData(Map<String, Object> rowData) { this.rowData = rowData; }
}
