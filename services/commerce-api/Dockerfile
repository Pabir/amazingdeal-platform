# Multi-stage Dockerfile for Spring Boot Commerce API
# Stage 1: Build application JAR
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Copy Maven wrapper & POM
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Make mvnw executable and download dependencies
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copy source code and package
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create unprivileged system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Create media upload directory
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Copy JAR from builder
COPY --from=builder /workspace/target/*.jar /app/app.jar
RUN chown appuser:appgroup /app/app.jar

USER appuser

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
