package com.aquatrack.dto;

import com.aquatrack.model.BillStatus;
import com.aquatrack.model.MeterStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

public class WaterSystemDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BuildingRequest {
        @NotBlank
        private String name;

        @NotBlank
        private String address;

        @NotNull
        private Long ownerId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApartmentRequest {
        @NotNull
        private Long buildingId;

        @NotBlank
        private String flatNumber;

        private Long residentId;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MeterRequest {
        @NotBlank
        private String serialNumber;

        @NotNull
        private Long apartmentId;

        private MeterStatus status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UsageReadingRequest {
        @NotNull
        private Long meterId;

        @NotNull @Positive
        private BigDecimal litersConsumed;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TariffRequest {
        @NotNull @Positive
        private BigDecimal ratePerLiter;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BillGenerationRequest {
        @NotNull
        private Long apartmentId;

        @NotNull
        private LocalDate startDate;

        @NotNull
        private LocalDate endDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentRequest {
        @NotNull
        private Long billId;

        @NotNull @Positive
        private BigDecimal amount;

        @NotBlank
        private String paymentMethod;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BillResponse {
        private Long id;
        private Long apartmentId;
        private String flatNumber;
        private String buildingName;
        private LocalDate billingStartDate;
        private LocalDate billingEndDate;
        private BigDecimal totalLiters;
        private BigDecimal totalAmount;
        private BillStatus status;
        private ZonedDateTime createdAt;
    }
}