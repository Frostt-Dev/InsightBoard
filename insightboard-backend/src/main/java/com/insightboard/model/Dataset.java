package com.insightboard.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "datasets")
public class Dataset {
    @Id
    private String id;
    private String name;
    private String fileName;
    private String userId;
    private int rowCount;
    private List<DatasetColumn> columns;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Dataset() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public int getRowCount() { return rowCount; }
    public void setRowCount(int rowCount) { this.rowCount = rowCount; }
    public List<DatasetColumn> getColumns() { return columns; }
    public void setColumns(List<DatasetColumn> columns) { this.columns = columns; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
