package com.insightboard.model;

public class DatasetColumn {
    private String name;
    private String dataType;
    private int columnIndex;

    public DatasetColumn() {}

    public DatasetColumn(String name, String dataType, int columnIndex) {
        this.name = name;
        this.dataType = dataType;
        this.columnIndex = columnIndex;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }
    public int getColumnIndex() { return columnIndex; }
    public void setColumnIndex(int columnIndex) { this.columnIndex = columnIndex; }
}
