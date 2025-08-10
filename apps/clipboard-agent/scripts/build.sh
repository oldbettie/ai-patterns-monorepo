#!/bin/bash

# @summary: Cross-platform build script for Clipboard Agent

set -e

BINARY_NAME="clipboard-agent"
VERSION=${VERSION:-"1.0.0-dev"}
BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S')
COMMIT_HASH=${COMMIT_HASH:-$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")}
SERVICE_URL=${SERVICE_URL:-"http://localhost:3000"}

# Create dist directory
mkdir -p dist

echo "Building Clipboard Agent v${VERSION}"
echo "Build time: ${BUILD_TIME}"
echo "Commit: ${COMMIT_HASH}"
echo "Service URL: ${SERVICE_URL}"
echo ""

# Build flags
LDFLAGS="-X main.Version=${VERSION} -X main.BuildTime=${BUILD_TIME} -X main.CommitHash=${COMMIT_HASH} -X main.DefaultServiceURL=${SERVICE_URL}"

# Build for multiple platforms
echo "Building for Linux (amd64)..."
GOOS=linux GOARCH=amd64 go build -ldflags "${LDFLAGS}" -o dist/${BINARY_NAME}-linux-amd64 cmd/agent/main.go

echo "Building for macOS (amd64)..."
GOOS=darwin GOARCH=amd64 go build -ldflags "${LDFLAGS}" -o dist/${BINARY_NAME}-darwin-amd64 cmd/agent/main.go

echo "Building for macOS (arm64)..."
GOOS=darwin GOARCH=arm64 go build -ldflags "${LDFLAGS}" -o dist/${BINARY_NAME}-darwin-arm64 cmd/agent/main.go

echo "Building for Windows (amd64)..."
GOOS=windows GOARCH=amd64 go build -ldflags "${LDFLAGS}" -o dist/${BINARY_NAME}-windows-amd64.exe cmd/agent/main.go

# Build for current platform
echo "Building for current platform..."
go build -ldflags "${LDFLAGS}" -o dist/${BINARY_NAME} cmd/agent/main.go

echo ""
echo "Build complete! Binaries available in dist/ directory:"
ls -la dist/

echo ""
echo "To run:"
echo "  ./dist/${BINARY_NAME}"
echo ""
echo "Built with default service URL: ${SERVICE_URL}"