package com.aquatrack.repository;

import com.aquatrack.model.DailyUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyUsageRepository extends JpaRepository<DailyUsage, Long> {
    List<DailyUsage> findByMeterIdAndUsageDateBetween(String meterId, LocalDate startDate, LocalDate endDate);
    List<DailyUsage> findByMeterId(String meterId);
}