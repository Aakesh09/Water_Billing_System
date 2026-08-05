package com.aquatrack.controller;

import com.aquatrack.model.Alert;
import com.aquatrack.model.DailyUsage;
import com.aquatrack.repository.AlertRepository;
import com.aquatrack.service.LeakDetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private LeakDetectionService leakDetectionService;

    // 1. Log Daily Meter Reading & Test Leak Outlier Engine
    @PostMapping("/log-usage")
    public ResponseEntity<?> logUsage(@RequestBody DailyUsage usage) {
        if (usage.getUsageDate() == null) {
            usage.setUsageDate(LocalDate.now());
        }
        Alert triggeredAlert = leakDetectionService.logDailyUsageAndCheck(usage);
        if (triggeredAlert != null) {
            return ResponseEntity.ok(triggeredAlert);
        }
        return ResponseEntity.ok("Daily usage recorded cleanly. No leak detected.");
    }

    // 2. Trigger Manual Scan for All Meters
    @PostMapping("/trigger-scan")
    public ResponseEntity<?> triggerScan() {
        leakDetectionService.scanForWaterLeaksAndOutliers();
        return ResponseEntity.ok("Statistical leak scan completed.");
    }

    // 3. Get Alerts for Apartment (Building Owner View)
    @GetMapping("/apartment/{apartmentName}")
    public ResponseEntity<List<Alert>> getApartmentAlerts(@PathVariable String apartmentName) {
        return ResponseEntity.ok(alertRepository.findByApartmentName(apartmentName));
    }

    // 4. Get Alerts for Resident (Resident View)
    @GetMapping("/flat/{apartmentName}/{flatNo}")
    public ResponseEntity<List<Alert>> getResidentAlerts(@PathVariable String apartmentName, @PathVariable String flatNo) {
        return ResponseEntity.ok(alertRepository.findByFlatNoAndApartmentName(flatNo, apartmentName));
    }

    // 5. Mark Alert as Resolved
    @PutMapping("/resolve/{alertId}")
    public ResponseEntity<?> resolveAlert(@PathVariable Long alertId) {
        Alert alert = alertRepository.findById(alertId).orElseThrow();
        alert.setIsResolved(true);
        return ResponseEntity.ok(alertRepository.save(alert));
    }
}