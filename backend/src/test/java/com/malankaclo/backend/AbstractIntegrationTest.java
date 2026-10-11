package com.malankaclo.backend;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Base class for integration tests that need a real PostgreSQL database.
 * <p>
 * A single {@link PostgreSQLContainer} is started once per test JVM (the Testcontainers
 * "singleton container" pattern) and its connection details are injected into the Spring
 * context via {@code @ServiceConnection}. Because the container outlives individual test
 * classes, the shared Spring context cache stays valid across the whole test suite.
 * Flyway migrations run against it, so the real schema is exercised.
 */
public abstract class AbstractIntegrationTest {

    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer("postgres:18.6")
                    .withDatabaseName("malanka")
                    .withUsername("malanka")
                    .withPassword("malanka");

    static {
        POSTGRES.start();
    }
}
