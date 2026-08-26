package com.aquatrack.repository;

import com.aquatrack.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCycleId(Long cycleId);
    List<Invoice> findByResidentEmail(String residentEmail);
    List<Invoice> findByApartmentName(String apartmentName);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
}