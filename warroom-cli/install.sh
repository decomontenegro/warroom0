#!/bin/bash

echo "==================================="
echo "    War Room CLI Installer"
echo "==================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "Installing War Room CLI dependencies..."
npm install --silent

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Create global link
echo "Creating global command 'warroom'..."
npm link

if [ $? -ne 0 ]; then
    echo "Error: Failed to create global command"
    echo "You may need to run this script with sudo: sudo ./install.sh"
    exit 1
fi

echo ""
echo "==================================="
echo "✓ War Room CLI installed successfully!"
echo "==================================="
echo ""
echo "You can now use the 'warroom' command from anywhere."
echo ""
echo "Quick start:"
echo "  warroom start              - Start a new War Room session"
echo "  warroom analyze <file>     - Analyze a code file"
echo "  warroom folder <path>      - Analyze an entire folder"
echo "  warroom dag                - Open DAG visualizer"
echo "  warroom agents             - List available agents"
echo "  warroom connect            - Connect to War Room server"
echo ""
echo "For more help, run: warroom --help"
echo ""