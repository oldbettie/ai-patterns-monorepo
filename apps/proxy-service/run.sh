#!/bin/bash

# Family Privacy Proxy Agent - Simple Run Script
# Builds and runs the local agent with mock configuration

set -e

echo "Building Family Privacy Proxy Agent..."
go build -o dist/family-proxy-agent cmd/agent/main.go

echo "Starting Family Privacy Proxy Agent..."
echo "Local Proxy: localhost:8081"
echo "Configuration: Mock API (development mode)"
echo "Press Ctrl+C to stop"
echo ""

./dist/family-proxy-agent --api mock --v