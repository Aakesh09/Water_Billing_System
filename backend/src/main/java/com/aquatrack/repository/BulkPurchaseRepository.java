package com.aquatrack.repository;

import com.aquatrack.model.BulkPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BulkPurchaseRepository extends JpaRepository<BulkPurchase, Long> {
    List<BulkPurchase> findByApartmentName(String apartmentName);
}