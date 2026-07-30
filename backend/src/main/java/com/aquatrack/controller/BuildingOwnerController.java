package com.aquatrack.controller;

import com.aquatrack.dto.WaterSystemDtos.*;
import com.aquatrack.model.*;
import com.aquatrack.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/owner")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'BUILDING_OWNER')")
@RequiredArgsConstructor
public class BuildingOwnerController {

    private final ApartmentRepository apartmentRepository;
    private final BuildingRepository buildingRepository;
    private final WaterMeterRepository meterRepository;
    private final UsageReadingRepository usageRepository;
    private final BillRepository billRepository;
    private final BillingTariffRepository tariffRepository;
    private final UserRepository userRepository;

    @PostMapping("/apartments")
    public ResponseEntity<?> createApartment(@Valid @RequestBody ApartmentRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new RuntimeException("Building not found"));

        User resident = request.getResidentId() != null ?
                userRepository.findById(request.getResidentId()).orElse(null) : null;

        Apartment apartment = Apartment.builder()
                .building(building)
                .flatNumber(request.getFlatNumber())
                .resident(resident)
                .build();

        return ResponseEntity.ok(apartmentRepository.save(apartment));
    }

    @PostMapping("/meters")
    public ResponseEntity<?> assignMeter(@Valid @RequestBody MeterRequest request) {
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Apartment not found"));

        WaterMeter meter = WaterMeter.builder()
                .serialNumber(request.getSerialNumber())
                .apartment(apartment)
                .status(request.getStatus() != null ? request.getStatus() : MeterStatus.ACTIVE)
                .build();

        return ResponseEntity.ok(meterRepository.save(meter));
    }

    @PostMapping("/readings")
    public ResponseEntity<?> recordReading(@Valid @RequestBody UsageReadingRequest request) {
        WaterMeter meter = meterRepository.findById(request.getMeterId())
                .orElseThrow(() -> new RuntimeException("Water meter not found"));

        UsageReading reading = UsageReading.builder()
                .meter(meter)
                .litersConsumed(request.getLitersConsumed())
                .build();

        return ResponseEntity.ok(usageRepository.save(reading));
    }

    @PostMapping("/generate-bill")
    public ResponseEntity<?> generateBill(@Valid @RequestBody BillGenerationRequest request) {
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Apartment not found"));

        WaterMeter meter = meterRepository.findByApartmentId(apartment.getId())
                .orElseThrow(() -> new RuntimeException("Water meter not assigned to this apartment"));

        ZonedDateTime start = request.getStartDate().atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime end = request.getEndDate().atTime(23, 59, 59).atZone(ZoneId.systemDefault());

        BigDecimal totalUsage = usageRepository.calculateTotalUsageForPeriod(meter.getId(), start, end);
        if (totalUsage == null) totalUsage = BigDecimal.ZERO;

        BillingTariff tariff = tariffRepository.findTopByOrderByEffectiveFromDesc()
                .orElseThrow(() -> new RuntimeException("Active billing tariff not found"));

        BigDecimal totalAmount = totalUsage.multiply(tariff.getRatePerLiter());

        Bill bill = Bill.builder()
                .apartment(apartment)
                .billingStartDate(request.getStartDate())
                .billingEndDate(request.getEndDate())
                .totalLiters(totalUsage)
                .totalAmount(totalAmount)
                .status(BillStatus.UNPAID)
                .build();

        return ResponseEntity.ok(billRepository.save(bill));
    }
}