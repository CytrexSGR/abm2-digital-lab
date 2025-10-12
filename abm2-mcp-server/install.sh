#!/bin/bash
# Installation script for ABM² MCP Server

echo "=== ABM² MCP Server Installation ==="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js >= 14.0.0 first"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js found: $NODE_VERSION"

# Make scripts executable
chmod +x abm2-mcp-bridge.js
chmod +x test-abm2-mcp.js
echo "✓ Made scripts executable"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file..."
    read -p "ABM2 API URL (default: http://localhost:8000): " api_url
    api_url=${api_url:-http://localhost:8000}

    read -p "ABM2 Username (default: admin): " username
    username=${username:-admin}

    read -sp "ABM2 Password: " password
    echo ""

    cat > .env << EOF
# ABM² MCP Server Environment Configuration
ABM2_API_URL=$api_url
ABM2_USERNAME=$username
ABM2_PASSWORD=$password
DEBUG=false
EOF
    echo "✓ Created .env file"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "=== Installation complete ==="
echo ""
echo "Next steps:"
echo "1. Make sure ABM² Backend is running at the configured URL"
echo "2. Test the MCP server: npm test"
echo "3. Configure Claude Desktop (see README.md)"
echo ""
echo "Claude Desktop configuration path:"
echo "  Linux:   ~/.config/Claude/claude_desktop_config.json"
echo "  macOS:   ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "  Windows: %APPDATA%\\Claude\\claude_desktop_config.json"
echo ""
echo "Example configuration:"
echo ""
cat claude-desktop-config.example.json
echo ""
