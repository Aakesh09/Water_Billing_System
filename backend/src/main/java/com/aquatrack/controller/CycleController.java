package com.aquatrack.controller;

import com.aquatrack.model.BillingCycle;
import com.aquatrack.model.Invoice;
import com.aquatrack.repository.BillingCycleRepository;
import com.aquatrack.repository.InvoiceRepository;
import com.aquatrack.service.DistributionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cycles")
@CrossOrigin(origins = "*")
public class CycleController {

    @Autowired
    private BillingCycleRepository cycleRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private DistributionService distributionService;

    // 1. Create New Billing Period Cycle
    @PostMapping("/open")
    public ResponseEntity<?> openCycle(@RequestParam String cycleName, @RequestParam String apartmentName) {
        BillingCycle cycle = BillingCycle.builder()
                .cycleName(cycleName)
                .apartmentName(apartmentName)
                .status("OPEN")
                .build();
        return ResponseEntity.ok(cycleRepository.save(cycle));
    }

    // 2. Finalize Cycle & Execute Distribution Algorithm
    @PostMapping("/finalize/{cycleId}")
    public ResponseEntity<?> finalizeCycle(@PathVariable Long cycleId, @RequestParam String apartmentName) {
        BillingCycle cycle = cycleRepository.findById(cycleId).orElseThrow();
        cycle.setStatus("FINALIZED");
        cycleRepository.save(cycle);

        List<Invoice> invoices = distributionService.calculateAndDistributeCycleCosts(cycleId, apartmentName);
        return ResponseEntity.ok(invoices);
    }

    // 3. Archive Cycle
    @PostMapping("/archive/{cycleId}")
    public ResponseEntity<?> archiveCycle(@PathVariable Long cycleId) {
        BillingCycle cycle = cycleRepository.findById(cycleId).orElseThrow();
        cycle.setStatus("ARCHIVED");
        return ResponseEntity.ok(cycleRepository.save(cycle));
    }

    // 4. Get Cycles by Apartment
    @GetMapping("/{apartmentName}")
    public ResponseEntity<List<BillingCycle>> getCycles(@PathVariable String apartmentName) {
        return ResponseEntity.ok(cycleRepository.findByApartmentName(apartmentName));
    }

    // 5. Get Invoices for a Cycle
    @GetMapping("/invoices/{cycleId}")
    public ResponseEntity<List<Invoice>> getCycleInvoices(@PathVariable Long cycleId) {
        return ResponseEntity.ok(invoiceRepository.findByCycleId(cycleId));
    }
}