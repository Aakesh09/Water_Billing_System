package com.aquatrack.dto;

import com.aquatrack.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

public class AuthDtos {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class JwtResponse {
        private String token;
        private Long id;
        private String email;
        private String fullName;
        private String role;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank
        private String fullName;

        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;

        private String phoneNumber;

        @NotNull
        private Role role;
    }
}