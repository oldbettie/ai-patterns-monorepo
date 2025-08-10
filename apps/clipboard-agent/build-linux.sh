#!/bin/bash

# @feature:build-script @domain:build @backend
# @summary: Build script for Linux clipboard agent

set -e

echo "🔨 Building Clipboard Agent for Linux..."

# Check Go version
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.19+ and try again."
    exit 1
fi

GO_VERSION=$(go version | grep -oP 'go\d+\.\d+' | sed 's/go//')
REQUIRED_VERSION="1.19"

if ! printf '%s\n%s\n' "$REQUIRED_VERSION" "$GO_VERSION" | sort -V -C; then
    echo "❌ Go version $GO_VERSION is too old. Please upgrade to Go 1.19+"
    exit 1
fi

# Check clipboard dependencies
echo "📋 Checking clipboard dependencies..."
CLIPBOARD_TOOLS=0

if command -v xclip &> /dev/null; then
    echo "✅ xclip found"
    CLIPBOARD_TOOLS=$((CLIPBOARD_TOOLS + 1))
fi

if command -v xsel &> /dev/null; then
    echo "✅ xsel found"
    CLIPBOARD_TOOLS=$((CLIPBOARD_TOOLS + 1))
fi

if command -v wl-copy &> /dev/null; then
    echo "✅ wl-copy found (Wayland)"
    CLIPBOARD_TOOLS=$((CLIPBOARD_TOOLS + 1))
fi

if [ $CLIPBOARD_TOOLS -eq 0 ]; then
    echo "❌ No clipboard tools found!"
    echo "Please install one of the following:"
    echo "  - For X11: sudo apt install xclip  OR  sudo apt install xsel"
    echo "  - For Wayland: sudo apt install wl-clipboard"
    exit 1
fi

# Build the application
echo "🚀 Building application..."
cd "$(dirname "$0")"

# Clean previous builds
rm -f dist/clipboard-agent-linux

# Create dist directory
mkdir -p dist

# Build with optimizations
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o dist/clipboard-agent-linux \
    cmd/agent/main.go

# Make it executable
chmod +x dist/clipboard-agent-linux

# Test the build
echo "🧪 Testing build..."
if ! ./dist/clipboard-agent-linux --version; then
    echo "❌ Build test failed"
    exit 1
fi

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📍 Binary location: $(pwd)/dist/clipboard-agent-linux"
echo ""
echo "🚀 Next steps:"
echo "  1. Run setup: ./dist/clipboard-agent-linux --setup"
echo "  2. Get API key from your dashboard"
echo "  3. Set environment: export CLIPBOARD_API_KEY=your_key_here"
echo "  4. Start the agent: ./dist/clipboard-agent-linux"
echo ""