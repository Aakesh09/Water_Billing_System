package com.aquatrack.service;

import com.aquatrack.model.BulkPurchase;
import com.aquatrack.model.Invoice;
import com.aquatrack.model.User;
import com.aquatrack.repository.BulkPurchaseRepository;
import com.aquatrack.repository.InvoiceRepository;
import com.aquatrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DistributionService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BulkPurchaseRepository bulkPurchaseRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    /**
     * Apportions total bulk water cost across households proportionally by metered consumption,
     * with fallback to flat area/equal distribution for unmetered households.
     */
    public List<Invoice> calculateAndDistributeCycleCosts(Long cycleId, String apartmentName) {
        // 1. Calculate Total Bulk Purchase Cost
        List<BulkPurchase> bulkPurchases = bulkPurchaseRepository.findByApartmentName(apartmentName);
        double totalBulkCost = bulkPurchases.stream().mapToDouble(BulkPurchase::getTotalCost).sum();

        // 2. Fetch all residents in this apartment
        List<User> residents = userRepository.findByApartmentName(apartmentName).stream()
                .filter(u -> u.getRole() == User.Role.RESIDENT)
                .toList();

        if (residents.isEmpty()) {
            return new ArrayList<>();
        }

        // 3. Separate Metered vs Unmetered Residents
        List<User> meteredResidents = residents.stream().filter(u -> u.getMeterId() != null && !u.getMeterId().isBlank()).toList();
        List<User> unmeteredResidents = residents.stream().filter(u -> u.getMeterId() == null || u.getMeterId().isBlank()).toList();

        // Sample metered usage mapping (default 12,000L for demo calculation)
        double totalMeteredLiters = meteredResidents.size() * 12000.0;

        List<Invoice> generatedInvoices = new ArrayList<>();

        // 4. Distribute costs
        for (User resident : residents) {
            double meteredUsage = (resident.getMeterId() != null) ? 12000.0 : 0.0;
            double sharedBulkAllocation = 0.0;

            if (resident.getMeterId() != null && totalMeteredLiters > 0) {
                // Proportional Distribution Formula
                sharedBulkAllocation = (meteredUsage / totalMeteredLiters) * (totalBulkCost * 0.7); // 70% bulk cost shared proportionally
            } else if (!unmeteredResidents.isEmpty()) {
                // Fallback Flat Rate Distribution
                sharedBulkAllocation = (totalBulkCost * 0.3) / unmeteredResidents.size(); // 30% divided equally
            }

            double baseCharge = meteredUsage * 0.02; // Base tariff
            double totalRupees = Math.round((baseCharge + sharedBulkAllocation) * 100.0) / 100.0;

            Invoice invoice = Invoice.builder()
                    .cycleId(cycleId)
                    .apartmentName(apartmentName)
                    .flatNo(resident.getFlatNo())
                    .blockNo(resident.getBlockNo())
                    .meterId(resident.getMeterId())
                    .meteredConsumptionLiters(meteredUsage)
                    .tieredBaseCharge(baseCharge)
                    .sharedBulkAllocation(Math.round(sharedBulkAllocation * 100.0) / 100.0)
                    .totalAmountRupees(totalRupees)
                    .paymentStatus("PENDING")
                    .build();

            generatedInvoices.add(invoiceRepository.save(invoice));
        }

        return generatedInvoices;
    }
}