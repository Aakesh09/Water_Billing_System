package com.aquatrack.controller;

import com.aquatrack.dto.WaterSystemDtos.*;
import com.aquatrack.model.*;
import com.aquatrack.repository.*;
import com.aquatrack.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resident")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'BUILDING_OWNER', 'RESIDENT')")
@RequiredArgsConstructor
public class ResidentController {

    private final ApartmentRepository apartmentRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final UsageReadingRepository usageRepository;
    private final WaterMeterRepository meterRepository;

    @GetMapping("/bills")
    public ResponseEntity<List<BillResponse>> getMyBills(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Apartment> apartments = apartmentRepository.findByResidentId(userDetails.getId());
        List<Long> apartmentIds = apartments.stream().map(Apartment::getId).collect(Collectors.toList());

        List<Bill> bills = apartmentIds.stream()
                .flatMap(id -> billRepository.findByApartmentId(id).stream())
                .toList();

        List<BillResponse> responses = bills.stream().map(b -> BillResponse.builder()
                .id(b.getId())
                .apartmentId(b.getApartment().getId())
                .flatNumber(b.getApartment().getFlatNumber())
                .buildingName(b.getApartment().getBuilding().getName())
                .billingStartDate(b.getBillingStartDate())
                .billingEndDate(b.getBillingEndDate())
                .totalLiters(b.getTotalLiters())
                .totalAmount(b.getTotalAmount())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/pay")
    public ResponseEntity<?> payBill(@Valid @RequestBody PaymentRequest request) {
        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (bill.getStatus() == BillStatus.PAID) {
            return ResponseEntity.badRequest().body("Bill is already paid");
        }

        Payment payment = Payment.builder()
                .bill(bill)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        bill.setStatus(BillStatus.PAID);
        billRepository.save(bill);

        return ResponseEntity.ok(paymentRepository.save(payment));
    }

    @GetMapping("/usage/{apartmentId}")
    public ResponseEntity<List<UsageReading>> getApartmentUsage(@PathVariable Long apartmentId) {
        WaterMeter meter = meterRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new RuntimeException("Meter not assigned to apartment"));

        return ResponseEntity.ok(usageRepository.findByMeterIdOrderByReadingTimestampDesc(meter.getId()));
    }
}