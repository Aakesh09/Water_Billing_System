package com.aquatrack.controller;

import com.aquatrack.model.User;
import com.aquatrack.repository.UserRepository;
import com.aquatrack.security.JwtUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: Email ID not found.");
        }

        // 1. Strict Role Tab Match Validation
        String expectedRole = loginRequest.getRole();
        if (expectedRole != null && !user.getRole().name().equalsIgnoreCase(expectedRole.replace("ROLE_", ""))) {
            return ResponseEntity.badRequest().body("Error: Selected role does not match account credentials!");
        }

        // 2. Super Admin Approval Check for Building Owners
        if (user.getRole().name().equalsIgnoreCase("BUILDING_OWNER")) {
            if ("PENDING".equalsIgnoreCase(user.getApprovalStatus())) {
                return ResponseEntity.badRequest().body("Error: Your account is pending approval from the Super Admin.");
            } else if ("REJECTED".equalsIgnoreCase(user.getApprovalStatus())) {
                return ResponseEntity.badRequest().body("Error: Your account application was rejected by the Super Admin.");
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        String jwt = jwtUtils.generateJwtToken(authentication);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("role", "ROLE_" + user.getRole().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email ID is already registered!");
        }

        if (signUpRequest.getMeterId() != null && userRepository.existsByMeterId(signUpRequest.getMeterId())) {
            return ResponseEntity.badRequest().body("Error: Meter ID " + signUpRequest.getMeterId() + " is already assigned!");
        }

        // Set default approval status for Building Owners
        if ("BUILDING_OWNER".equalsIgnoreCase(signUpRequest.getRole().name())) {
            signUpRequest.setApprovalStatus("PENDING");
        } else {
            signUpRequest.setApprovalStatus("APPROVED");
        }

        signUpRequest.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        userRepository.save(signUpRequest);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Error: Email ID not registered in database!");
        }
        return ResponseEntity.ok("OTP sent successfully. Demo Code: 123456");
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest resetRequest) {
        User user = userRepository.findByEmail(resetRequest.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Error: User not found.");
        }

        if (!"123456".equals(resetRequest.getOtp())) {
            return ResponseEntity.badRequest().body("Error: Invalid OTP code.");
        }

        // Properly re-hash and update password in PostgreSQL
        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully.");
    }
}

@Data
class LoginRequest {
    private String email;
    private String password;
    private String role;
}

@Data
class ResetPasswordRequest {
    private String email;
    private String otp;
    private String newPassword;
}