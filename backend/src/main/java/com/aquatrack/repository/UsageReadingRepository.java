package com.aquatrack.repository;

import com.aquatrack.model.UsageReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface UsageReadingRepository extends JpaRepository<UsageReading, Long> {
    List<UsageReading> findByMeterIdOrderByReadingTimestampDesc(Long meterId);

    @Query("SELECT SUM(u.litersConsumed) FROM UsageReading u WHERE u.meter.id = :meterId " +
           "AND u.readingTimestamp BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalUsageForPeriod(@Param("meterId") Long meterId,
                                            @Param("startDate") ZonedDateTime startDate,
                                            @Param("endDate") ZonedDateTime endDate);
}