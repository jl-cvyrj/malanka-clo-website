package com.malankaclo.backend.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Loads admin accounts for Spring Security. Unknown or disabled accounts produce the same
 * generic failure so that account existence is not leaked.
 */
@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser adminUser = adminUserRepository
                .findByUsernameIgnoreCase(username == null ? "" : username.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Bad credentials"));

        return User.withUsername(adminUser.getUsername())
                .password(adminUser.getPasswordHash())
                .roles(adminUser.getRole().name())
                .disabled(!adminUser.isEnabled())
                .build();
    }
}
