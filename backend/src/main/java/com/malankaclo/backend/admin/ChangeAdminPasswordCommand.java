package com.malankaclo.backend.admin;

public record ChangeAdminPasswordCommand(
        Long adminUserId,
        String newPassword
) {
}
