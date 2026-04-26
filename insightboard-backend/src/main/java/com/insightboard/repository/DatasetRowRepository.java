package com.insightboard.repository;

import com.insightboard.model.DatasetRow;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DatasetRowRepository extends MongoRepository<DatasetRow, String> {
    List<DatasetRow> findByDatasetId(String datasetId);
    void deleteByDatasetId(String datasetId);
    long countByDatasetId(String datasetId);
}
