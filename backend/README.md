# MALANKA.clo backend

Spring Boot backend for the MALANKA.clo clothing store.

## Current stage

- PostgreSQL in Docker Compose
- Flyway migrations
- JPA entities
- Spring Data repositories
- service layer
- no controllers yet
- no Spring Security yet

## Requirements

- Java 21+
- Maven 3.6.3+
- Docker + Docker Compose

## Start PostgreSQL

```bash
cp .env.example .env
docker compose up -d
```

## Start backend

```bash
mvn spring-boot:run
```

Flyway runs automatically on application startup.
