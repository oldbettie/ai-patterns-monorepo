# Build stage
FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /build

# Copy go.mod and go.sum for dependency caching
COPY apps/proxy-service/go.mod apps/proxy-service/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY apps/proxy-service/ ./

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o family-proxy cmd/agent/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1001 -S proxy && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G proxy -g proxy proxy

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/family-proxy .

# Create directories with proper permissions
RUN mkdir -p /app/configs /app/certs && \
    chown -R proxy:proxy /app

# Switch to non-root user
USER proxy

# Expose ports
EXPOSE 8080 8443 9090

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:9090/health || exit 1

# Run the binary
CMD ["./family-proxy"]