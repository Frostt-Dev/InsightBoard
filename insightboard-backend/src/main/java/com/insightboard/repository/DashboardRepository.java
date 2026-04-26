package com.insightboard.repository;

import com.insightboard.model.Dashboard;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DashboardRepository extends MongoRepository<Dashboard, String> {
    List<Dashboard> findByUserId(String userId);
    Optional<Dashboard> findByShareId(String shareId);
}
