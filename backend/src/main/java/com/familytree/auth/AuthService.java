package com.familytree.auth;

import com.familytree.auth.dto.AuthResponse;
import com.familytree.auth.dto.LoginRequest;
import com.familytree.auth.dto.RegisterRequest;
import com.familytree.user.User;
import com.familytree.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Value("${app.admin-only-mode}")
    private boolean adminOnlyMode;

    @Value("${app.admin-email}")
    private String adminEmail;

    public boolean isAdminOnlyMode() {
        return adminOnlyMode;
    }

    public AuthResponse register(RegisterRequest request) {
        if (adminOnlyMode) {
            throw new IllegalStateException(
                "Registration is currently disabled. This app is in admin-only mode.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        if (adminOnlyMode && !request.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new IllegalStateException(
                "This app is in admin-only mode. Only the administrator can log in.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }
}
