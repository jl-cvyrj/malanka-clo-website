# ---- Build stage ----
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy the whole project (target/ and .env are excluded via .dockerignore) and
# let the Maven wrapper build the Spring Boot fat jar.
COPY . .
RUN ./mvnw -B -DskipTests package

# ---- Runtime stage ----
FROM eclipse-temurin:25-jre
WORKDIR /app

COPY --from=build /app/target/backend-*.jar app.jar

# Render injects $PORT; the app reads it (see application.yaml). 8080 is the
# local default.
EXPOSE 8080

# Respect a JVM memory cap via JAVA_OPTS if provided, otherwise use defaults.
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
