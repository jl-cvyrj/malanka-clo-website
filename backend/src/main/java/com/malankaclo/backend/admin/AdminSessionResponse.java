package com.malankaclo.backend.admin;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

public record AdminSessionResponse(
        String username,
        List<String> roles
) {

    public static AdminSessionResponse from(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        return new AdminSessionResponse(authentication.getName(), roles);
    }
}
