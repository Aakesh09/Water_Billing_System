package com.aquatrack.controller;

import com.aquatrack.dto.AuthDtos.*;
import com.aquatrack.model.Role;
import com.aquatrack.model.User;
import com.aquatrack.repository.UserRepository;
import com.aquatrack.security.JwtUtils;
import com.aquatrack.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .role(role)
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = User.builder()
                .fullName(signUpRequest.getFullName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .phoneNumber(signUpRequest.getPhoneNumber())
                .role(signUpRequest.getRole())
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @GetMapping("/reset-admin")
    public ResponseEntity<?> resetAdmin() {
        User admin = userRepository.findByEmail("admin@aquatrack.com")
                .orElse(User.builder()
                        .fullName("System Super Admin")
                        .email("admin@aquatrack.com")
                        .role(Role.SUPER_ADMIN)
                        .build());

        admin.setPassword(encoder.encode("admin123"));
        userRepository.save(admin);
        return ResponseEntity.ok("Admin password reset successfully to: admin123");
    }
}