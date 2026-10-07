package com.malankaclo.backend.admin;

public record CreateAdminUserCommand(
        String username,
        String password
) {
}
