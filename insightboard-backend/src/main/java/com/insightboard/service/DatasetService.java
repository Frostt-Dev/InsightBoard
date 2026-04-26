package com.insightboard.service;

import com.insightboard.model.Dataset;
import com.insightboard.model.DatasetColumn;
import com.insightboard.model.DatasetRow;
import com.insightboard.repository.DatasetRepository;
import com.insightboard.repository.DatasetRowRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class DatasetService {

    private final DatasetRepository datasetRepository;
    private final DatasetRowRepository datasetRowRepository;
    private final MongoTemplate mongoTemplate;

    public DatasetService(DatasetRepository datasetRepository,
                          DatasetRowRepository datasetRowRepository,
                          MongoTemplate mongoTemplate) {
        this.datasetRepository = datasetRepository;
        this.datasetRowRepository = datasetRowRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public Dataset uploadDataset(MultipartFile file, String userId) throws Exception {
        String fileName = file.getOriginalFilename();
        if (fileName == null) throw new RuntimeException("Invalid file name");

        List<String[]> rawData;
        if (fileName.endsWith(".csv")) {
            rawData = parseCsv(file);
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
            rawData = parseExcel(file);
        } else {
            throw new RuntimeException("Unsupported file format. Please upload CSV or Excel files.");
        }

        if (rawData.isEmpty()) throw new RuntimeException("File is empty");

        String[] headers = rawData.get(0);
        List<String[]> dataRows = rawData.subList(1, rawData.size());

        // Detect column types from data
        List<DatasetColumn> columns = detectColumnTypes(headers, dataRows);

        // Create dataset metadata
        Dataset dataset = new Dataset();
        dataset.setName(fileName.replaceAll("\\.[^.]+$", "")); // Remove extension
        dataset.setFileName(fileName);
        dataset.setUserId(userId);
        dataset.setRowCount(dataRows.size());
        dataset.setColumns(columns);
        dataset = datasetRepository.save(dataset);

        // Store rows as documents
        List<DatasetRow> rows = new ArrayList<>();
        for (String[] row : dataRows) {
            Map<String, Object> rowData = new LinkedHashMap<>();
            for (int i = 0; i < headers.length && i < row.length; i++) {
                rowData.put(headers[i], parseValue(row[i], columns.get(i).getDataType()));
            }
            rows.add(new DatasetRow(dataset.getId(), rowData));
        }

        // Batch insert for performance
        if (!rows.isEmpty()) {
            datasetRowRepository.saveAll(rows);
        }

        return dataset;
    }

    public List<Dataset> getUserDatasets(String userId) {
        return datasetRepository.findByUserId(userId);
    }

    public Dataset getDataset(String datasetId) {
        return datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
    }

    public Map<String, Object> getDatasetPreview(String datasetId) {
        Dataset dataset = getDataset(datasetId);

        Query query = new Query(Criteria.where("datasetId").is(datasetId))
                .limit(100);
        List<DatasetRow> rows = mongoTemplate.find(query, DatasetRow.class);

        List<Map<String, Object>> rowDataList = rows.stream()
                .map(DatasetRow::getRowData)
                .toList();

        Map<String, Object> preview = new HashMap<>();
        preview.put("dataset", dataset);
        preview.put("rows", rowDataList);
        preview.put("totalRows", dataset.getRowCount());
        preview.put("previewRows", rowDataList.size());
        return preview;
    }

    public void deleteDataset(String datasetId) {
        datasetRowRepository.deleteByDatasetId(datasetId);
        datasetRepository.deleteById(datasetId);
    }

    private List<String[]> parseCsv(MultipartFile file) throws IOException, CsvException {
        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            return reader.readAll();
        }
    }

    private List<String[]> parseExcel(MultipartFile file) throws IOException {
        List<String[]> data = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (Row row : sheet) {
                String[] rowData = new String[row.getLastCellNum()];
                for (int i = 0; i < row.getLastCellNum(); i++) {
                    Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    rowData[i] = formatter.formatCellValue(cell);
                }
                data.add(rowData);
            }
        }
        return data;
    }

    private List<DatasetColumn> detectColumnTypes(String[] headers, List<String[]> dataRows) {
        List<DatasetColumn> columns = new ArrayList<>();
        for (int i = 0; i < headers.length; i++) {
            String type = detectType(dataRows, i);
            columns.add(new DatasetColumn(headers[i], type, i));
        }
        return columns;
    }

    private static final Pattern[] DATE_PATTERNS = {
        Pattern.compile("^\\d{4}-\\d{2}-\\d{2}.*"),           // 2024-01-15, 2024-01-15T10:30:00
        Pattern.compile("^\\d{2}/\\d{2}/\\d{4}$"),            // 01/15/2024, 15/01/2024
        Pattern.compile("^\\d{2}-\\d{2}-\\d{4}$"),            // 01-15-2024
        Pattern.compile("^\\d{1,2}/\\d{1,2}/\\d{2,4}$"),      // 1/5/24
        Pattern.compile("^[A-Za-z]+ \\d{1,2},? \\d{4}$"),     // January 15, 2024
        Pattern.compile("^\\d{1,2} [A-Za-z]+ \\d{4}$"),       // 15 January 2024
    };

    private String detectType(List<String[]> dataRows, int colIndex) {
        int numericCount = 0;
        int dateCount = 0;
        int totalNonEmpty = 0;

        for (String[] row : dataRows) {
            if (colIndex >= row.length || row[colIndex] == null || row[colIndex].trim().isEmpty()) continue;
            totalNonEmpty++;
            String val = row[colIndex].trim();
            try {
                Double.parseDouble(val.replace(",", ""));
                numericCount++;
            } catch (NumberFormatException e) {
                // not numeric
            }
            for (Pattern p : DATE_PATTERNS) {
                if (p.matcher(val).matches()) {
                    dateCount++;
                    break;
                }
            }
        }

        if (totalNonEmpty == 0) return "STRING";
        if (dateCount > totalNonEmpty * 0.8) return "DATE";
        return (numericCount > totalNonEmpty * 0.8) ? "NUMBER" : "STRING";
    }

    private Object parseValue(String value, String type) {
        if (value == null || value.trim().isEmpty()) return null;
        if ("NUMBER".equals(type)) {
            try {
                return Double.parseDouble(value.trim().replace(",", ""));
            } catch (NumberFormatException e) {
                return value;
            }
        }
        if ("DATE".equals(type)) {
            return parseAndFormatDate(value.trim());
        }
        return value;
    }

    private String parseAndFormatDate(String val) {
        // Try common formats. If successful, return YYYY-MM-DD or ISO 8601.
        List<DateTimeFormatter> formatters = Arrays.asList(
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("MM-dd-yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("M/d/yy"),
            DateTimeFormatter.ofPattern("M/d/yyyy"),
            DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH)
        );

        for (DateTimeFormatter formatter : formatters) {
            try {
                // Try parse as LocalDateTime first
                LocalDateTime ldt = LocalDateTime.parse(val, formatter);
                return ldt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException e) {
                try {
                    // Fallback to LocalDate
                    LocalDate ld = LocalDate.parse(val, formatter);
                    return ld.format(DateTimeFormatter.ISO_LOCAL_DATE);
                } catch (DateTimeParseException ex) {
                    // Continue to next format
                }
            }
        }
        // If parsing fails, store as original string
        return val;
    }
}
