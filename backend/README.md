# MALANKA.clo backend

Spring Boot backend for the MALANKA.clo clothing store.

## Current stage

- PostgreSQL in Docker Compose
- Flyway migrations (`V1` schema, `V2` category seed, `V3` currency type fix)
- JPA entities, Spring Data repositories, service layer
- integration tests against a real PostgreSQL via Testcontainers
- no REST controllers yet
- no Spring Security configuration yet

## Requirements

- JDK 25+ (the build is verified on JDK 27)
- Maven 3.6.3+ (Maven Wrapper included)
- Docker + Docker Compose (required for integration tests)

> Lombok is pinned to `1.18.48` in `pom.xml`. Earlier versions (including the
> Spring Boot 4.1.1 default `1.18.46`) are not compatible with JDK 27. The build
> also enables annotation processing explicitly (`<proc>full</proc>`), because
> JDK 23+ disables it by default.

## Start PostgreSQL

```bash
cp .env.example .env
docker compose up -d
```

## Start backend

```bash
./mvnw spring-boot:run
```

Flyway runs automatically on application startup.

## Run tests

Integration tests start a throwaway `postgres:18.6` container, so Docker must be running:

```bash
./mvnw test
```
