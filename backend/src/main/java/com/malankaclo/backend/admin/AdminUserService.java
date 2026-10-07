package com.malankaclo.backend.admin;

import com.malankaclo.backend.common.exception.BusinessException;
import com.malankaclo.backend.common.exception.DuplicateResourceException;
import com.malankaclo.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final int MAX_USERNAME_LENGTH = 100;
    
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    
    public List<AdminUser> findAll() {
        return adminUserRepository.findAllByOrderByUsernameAsc();
    }
    
    public List<AdminUser> findAllEnabled() {
        return adminUserRepository.findAllByEnabledTrueOrderByUsernameAsc();
    }
    
    public AdminUser findById(Long id) {
        return adminUserRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Admin user not found: " + id));
    }
    
    public AdminUser findByUsername(String username) {
        String normalizedUsername = normalizeUsername(username);
        
        return adminUserRepository
                .findByUsernameIgnoreCase(normalizedUsername)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Admin user not found: "
                                        + normalizedUsername));
    }
    
    public AdminUser findEnabledByUsername(String username) {
        String normalizedUsername = normalizeUsername(username);
        
        return adminUserRepository
                .findByUsernameIgnoreCaseAndEnabledTrue(normalizedUsername)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Enabled admin user not found: "
                                        + normalizedUsername));
    }
    
    public boolean matchesPassword(
            AdminUser adminUser,
            String rawPassword
    ) {
        if (adminUser == null
                || rawPassword == null
                || !adminUser.isEnabled()) {
            return false;
        }
        
        return passwordEncoder.matches(
                rawPassword,
                adminUser.getPasswordHash()
        );
    }
    
    @Transactional
    public AdminUser create(CreateAdminUserCommand command) {
        
        validateCreateCommand(command);
        
        String username =
                normalizeUsername(command.username());
        
        if (adminUserRepository
                .existsByUsernameIgnoreCase(username)) {
            
            throw new DuplicateResourceException(
                    "Admin username already exists: "
                            + username
            );
        }
        
        String passwordHash =
                passwordEncoder.encode(command.password());
        
        return adminUserRepository.save(
                new AdminUser(username, passwordHash)
        );
    }
    
    @Transactional
    public void changePassword(
            ChangeAdminPasswordCommand command
    ) {
        
        if (command == null
                || command.adminUserId() == null) {
            
            throw new BusinessException(
                    "Admin user id is required");
        }
        
        validatePassword(command.newPassword());
        
        AdminUser adminUser =
                findById(command.adminUserId());
        
        adminUser.setPasswordHash(
                passwordEncoder.encode(
                        command.newPassword()
                )
        );
    }
    
    @Transactional
    public void disable(Long id) {
        
        AdminUser adminUser = findById(id);
        
        if (!adminUser.isEnabled()) {
            return;
        }
        
        long enabledAdmins =
                adminUserRepository
                        .countByEnabledTrueAndRole(
                                AdminRole.ADMIN
                        );
        
        if (enabledAdmins <= 1) {
            throw new BusinessException(
                    "Cannot disable the last enabled administrator"
            );
        }
        
        adminUser.setEnabled(false);
    }
    
    @Transactional
    public void enable(Long id) {
        findById(id).setEnabled(true);
    }
    
    @Transactional
    public void rename(Long id, String newUsername) {
        
        String normalizedUsername =
                normalizeUsername(newUsername);
        
        AdminUser adminUser = findById(id);
        
        if (!adminUser.getUsername()
                .equalsIgnoreCase(normalizedUsername)
                && adminUserRepository
                .existsByUsernameIgnoreCase(
                        normalizedUsername)) {
            
            throw new DuplicateResourceException(
                    "Admin username already exists: "
                            + normalizedUsername
            );
        }
        
        adminUser.setUsername(
                normalizedUsername
        );
    }
    
    private void validateCreateCommand(
            CreateAdminUserCommand command
    ) {
        if (command == null) {
            throw new BusinessException(
                    "Create admin command must not be null");
        }
        
        normalizeUsername(command.username());
        validatePassword(command.password());
    }
    
    private String normalizeUsername(String username) {
        
        if (username == null) {
            throw new BusinessException(
                    "Username is required");
        }
        
        String normalized =
                username.trim()
                        .toLowerCase(Locale.ROOT);
        
        if (normalized.isBlank()) {
            throw new BusinessException(
                    "Username is required");
        }
        
        if (normalized.length() > MAX_USERNAME_LENGTH) {
            throw new BusinessException(
                    "Username is too long");
        }
        
        return normalized;
    }
    
    private void validatePassword(String password) {
        
        if (password == null || password.isBlank()) {
            throw new BusinessException(
                    "Password is required");
        }
        
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new BusinessException(
                    "Password must contain at least "
                            + MIN_PASSWORD_LENGTH
                            + " characters");
        }
    }
}
