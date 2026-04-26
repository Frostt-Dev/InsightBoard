package com.insightboard.repository;

import com.insightboard.model.Dataset;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DatasetRepository extends MongoRepository<Dataset, String> {
    List<Dataset> findByUserId(String userId);
}
