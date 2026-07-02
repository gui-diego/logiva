package com.logistics.dashboard.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logistics.dashboard.domain.entity.User;
import com.logistics.dashboard.domain.repository.UserRepository;
import com.logistics.dashboard.dto.request.CreateUserRequest;
import com.logistics.dashboard.dto.response.UserResponse;
import com.logistics.dashboard.exception.BusinessException;
import com.logistics.dashboard.exception.ResourceNotFoundException;
import com.logistics.dashboard.mapper.EntityMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityMapper entityMapper;

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(entityMapper::toUserResponse)
                .toList();
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("E-mail já cadastrado: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .active(true)
                .build();

        return entityMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse deactivate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
        user.setActive(false);
        return entityMapper.toUserResponse(userRepository.save(user));
    }
}
