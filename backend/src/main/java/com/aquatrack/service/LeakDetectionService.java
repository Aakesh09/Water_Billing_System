package com.aquatrack.service;

import com.aquatrack.model.Alert;
import com.aquatrack.model.DailyUsage;
import com.aquatrack.model.User;
import com.aquatrack.repository.AlertRepository;
import com.aquatrack.repository.DailyUsageRepository;
import com.aquatrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeakDetectionService {

    @Autowired
    private DailyUsageRepository dailyUsageRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Spring Scheduled Task: Runs daily at midnight (or manual trigger) to scan all meters for leaks (> 2σ above mean)
     */
    @Scheduled(cron = "0 0 0 * * ?") // Daily at Midnight
    public void scanForWaterLeaksAndOutliers() {
        List<User> residents = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.RESIDENT && u.getMeterId() != null)
                .toList();

        LocalDate today = LocalDate.now();
        LocalDate thirtyDaysAgo = today.minusDays(30);

        for (User resident : residents) {
            String meterId = resident.getMeterId();
            List<DailyUsage> pastUsages = dailyUsageRepository.findByMeterIdAndUsageDateBetween(meterId, thirtyDaysAgo, today);

            if (pastUsages.size() < 3) {
                continue; // Need at least 3 records to calculate standard deviation
            }

            // 1. Calculate Mean (μ)
            double sum = pastUsages.stream().mapToDouble(DailyUsage::getVolumeLiters).sum();
            double mean = sum / pastUsages.size();

            // 2. Calculate Standard Deviation (σ)
            double varianceSum = 0.0;
            for (DailyUsage usage : pastUsages) {
                varianceSum += Math.pow(usage.getVolumeLiters() - mean, 2);
            }
            double stdDev = Math.sqrt(varianceSum / pastUsages.size());

            // 3. Statistical Leak Threshold (Mean + 2 * StdDev)
            double leakThreshold = mean + (2 * stdDev);

            // Fetch today's latest usage
            DailyUsage latestUsage = pastUsages.get(pastUsages.size() - 1);

            if (latestUsage.getVolumeLiters() > leakThreshold) {
                // Flag Outlier / Potential Water Leak
                Alert leakAlert = Alert.builder()
                        .meterId(meterId)
                        .flatNo(resident.getFlatNo())
                        .apartmentName(resident.getApartmentName())
                        .alertType("LEAK_DETECTED")
                        .message(String.format("ANOMALY DETECTED: Daily usage of %.1f L exceeded statistical leak threshold of %.1f L (> 2σ above 30-day average).",
                                latestUsage.getVolumeLiters(), leakThreshold))
                        .consumptionLiters(latestUsage.getVolumeLiters())
                        .thresholdLimit(Math.round(leakThreshold * 10.0) / 10.0)
                        .isResolved(false)
                        .build();

                alertRepository.save(leakAlert);
            }
        }
    }

    /**
     * Manually Log Daily Usage & Trigger Instant Leak Inspection
     */
    public Alert logDailyUsageAndCheck(DailyUsage usage) {
        dailyUsageRepository.save(usage);

        // Fetch past usages for this meter
        List<DailyUsage> usages = dailyUsageRepository.findByMeterId(usage.getMeterId());

        if (usages.size() >= 2) {
            double mean = usages.stream().mapToDouble(DailyUsage::getVolumeLiters).average().orElse(0.0);
            double variance = usages.stream().mapToDouble(u -> Math.pow(u.getVolumeLiters() - mean, 2)).average().orElse(0.0);
            double stdDev = Math.sqrt(variance);
            double threshold = mean + (2 * stdDev);

            if (usage.getVolumeLiters() > threshold && threshold > 0) {
                Alert alert = Alert.builder()
                        .meterId(usage.getMeterId())
                        .flatNo(usage.getFlatNo())
                        .apartmentName(usage.getApartmentName())
                        .alertType("LEAK_DETECTED")
                        .message(String.format("POTENTIAL LEAK WARNING: Daily usage (%.1f L) is > 2σ above 30-day mean threshold (%.1f L).", usage.getVolumeLiters(), threshold))
                        .consumptionLiters(usage.getVolumeLiters())
                        .thresholdLimit(Math.round(threshold * 10.0) / 10.0)
                        .isResolved(false)
                        .build();

                return alertRepository.save(alert);
            }
        }
        return null;
    }
}