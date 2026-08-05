package com.aquatrack.repository;

import com.aquatrack.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCycleId(Long cycleId);
    List<Invoice> findByFlatNoAndApartmentName(String flatNo, String apartmentName);
}