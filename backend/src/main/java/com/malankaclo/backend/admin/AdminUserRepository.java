package com.malankaclo.backend.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    
    Optional<AdminUser>
    findByUsernameIgnoreCase(String username);
    
    Optional<AdminUser>
    findByUsernameIgnoreCaseAndEnabledTrue(
            String username
    );
    
    List<AdminUser>
    findAllByOrderByUsernameAsc();
    
    List<AdminUser>
    findAllByEnabledTrueOrderByUsernameAsc();
    
    boolean existsByUsernameIgnoreCase(
            String username
    );
    
    long countByEnabledTrueAndRole(
            AdminRole role
    );
}
