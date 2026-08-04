package com.aquatrack.controller;

import com.aquatrack.model.BulkPurchase;
import com.aquatrack.model.TariffConfig;
import com.aquatrack.repository.BulkPurchaseRepository;
import com.aquatrack.repository.TariffConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*")
public class BillingController {

    @Autowired
    private TariffConfigRepository tariffConfigRepository;

    @Autowired
    private BulkPurchaseRepository bulkPurchaseRepository;

    // --- TIERED TARIFF CALCULATION ---
    @PostMapping("/calculate-tiered")
    public ResponseEntity<?> calculateTieredBill(
            @RequestParam String apartmentName,
            @RequestParam Double consumptionLiters) {

        TariffConfig tariff = tariffConfigRepository.findByApartmentName(apartmentName)
                .orElse(TariffConfig.builder()
                        .apartmentName(apartmentName)
                        .baseVolumeKl(10.0)      // Default 10 kL (10,000 Liters)
                        .baseRatePerKl(15.0)     // Default ₹15 / kL
                        .tier2RatePerKl(35.0)    // Default ₹35 / kL beyond base
                        .build());

        double consumptionKl = consumptionLiters / 1000.0;
        double baseVolume = tariff.getBaseVolumeKl();
        double baseCharge = 0.0;
        double tier2Charge = 0.0;

        if (consumptionKl <= baseVolume) {
            baseCharge = consumptionKl * tariff.getBaseRatePerKl();
        } else {
            baseCharge = baseVolume * tariff.getBaseRatePerKl();
            tier2Charge = (consumptionKl - baseVolume) * tariff.getTier2RatePerKl();
        }

        double totalAmount = baseCharge + tier2Charge;

        Map<String, Object> response = new HashMap<>();
        response.put("apartmentName", apartmentName);
        response.put("consumptionLiters", consumptionLiters);
        response.put("consumptionKl", consumptionKl);
        response.put("baseVolumeKl", baseVolume);
        response.put("baseCharge", Math.round(baseCharge * 100.0) / 100.0);
        response.put("tier2Charge", Math.round(tier2Charge * 100.0) / 100.0);
        response.put("totalAmountInRupees", Math.round(totalAmount * 100.0) / 100.0);

        return ResponseEntity.ok(response);
    }

    // --- CONFIGURE TARIFF PER APARTMENT ---
    @PostMapping("/tariff-config")
    public ResponseEntity<?> saveTariffConfig(@RequestBody TariffConfig config) {
        TariffConfig existing = tariffConfigRepository.findByApartmentName(config.getApartmentName())
                .orElse(null);

        if (existing != null) {
            existing.setBaseVolumeKl(config.getBaseVolumeKl());
            existing.setBaseRatePerKl(config.getBaseRatePerKl());
            existing.setTier2RatePerKl(config.getTier2RatePerKl());
            return ResponseEntity.ok(tariffConfigRepository.save(existing));
        }

        return ResponseEntity.ok(tariffConfigRepository.save(config));
    }

    // --- BULK WATER PURCHASE MODULE ---
    @PostMapping("/bulk-purchase")
    public ResponseEntity<?> logBulkPurchase(@RequestBody BulkPurchase purchase) {
        if (purchase.getTotalCost() == null) {
            purchase.setTotalCost(purchase.getVolumeLiters() * purchase.getUnitCostPerLiter());
        }
        return ResponseEntity.ok(bulkPurchaseRepository.save(purchase));
    }

    @GetMapping("/bulk-purchases/{apartmentName}")
    public ResponseEntity<List<BulkPurchase>> getBulkPurchases(@PathVariable String apartmentName) {
        return ResponseEntity.ok(bulkPurchaseRepository.findByApartmentName(apartmentName));
    }
}