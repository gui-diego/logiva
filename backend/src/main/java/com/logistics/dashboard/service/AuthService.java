package com.logistics.dashboard.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logistics.dashboard.domain.entity.User;
import com.logistics.dashboard.domain.repository.UserRepository;
import com.logistics.dashboard.dto.request.LoginRequest;
import com.logistics.dashboard.dto.request.RefreshTokenRequest;
import com.logistics.dashboard.dto.response.AuthResponse;
import com.logistics.dashboard.dto.response.UserResponse;
import com.logistics.dashboard.exception.ResourceNotFoundException;
import com.logistics.dashboard.mapper.EntityMapper;
import com.logistics.dashboard.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtTokenProvider.isTokenValid(token)) {
            throw new ResourceNotFoundException("Refresh token inválido ou expirado");
        }

        String email = jwtTokenProvider.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return entityMapper.toUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtTokenProvider.generateAccessToken(user))
                .refreshToken(jwtTokenProvider.generateRefreshToken(user))
                .user(entityMapper.toUserResponse(user))
                .build();
    }
}
