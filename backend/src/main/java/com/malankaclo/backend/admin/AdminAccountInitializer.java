package com.malankaclo.backend.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Provisions the first administrator account from environment configuration on startup.
 * <p>
 * No password is ever hardcoded: credentials must be supplied through
 * {@code APP_ADMIN_INITIAL_USERNAME} / {@code APP_ADMIN_INITIAL_PASSWORD}. If no admin account
 * exists and the variables are absent, startup continues but the admin API stays inaccessible.
 * Existing accounts are never modified.
 */
@Component
public class AdminAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final AdminUserRepository adminUserRepository;
    private final AdminUserService adminUserService;
    private final String initialUsername;
    private final String initialPassword;

    public AdminAccountInitializer(AdminUserRepository adminUserRepository,
                                   AdminUserService adminUserService,
                                   @Value("${app.admin.initial-username:${APP_ADMIN_INITIAL_USERNAME:}}")
                                   String initialUsername,
                                   @Value("${app.admin.initial-password:${APP_ADMIN_INITIAL_PASSWORD:}}")
                                   String initialPassword) {
        this.adminUserRepository = adminUserRepository;
        this.adminUserService = adminUserService;
        this.initialUsername = initialUsername;
        this.initialPassword = initialPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (adminUserRepository.count() > 0) {
            return;
        }

        if (initialUsername.isBlank() || initialPassword.isBlank()) {
            log.warn("No administrator account exists and APP_ADMIN_INITIAL_USERNAME/APP_ADMIN_INITIAL_PASSWORD "
                    + "are not set. The admin API is inaccessible until an account is provisioned.");
            return;
        }

        adminUserService.create(new CreateAdminUserCommand(initialUsername, initialPassword));
        log.info("Initial administrator account '{}' created from environment configuration.", initialUsername);
    }
}
