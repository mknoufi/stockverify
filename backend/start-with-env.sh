#!/bin/bash
# Start backend server with environment variables loaded

echo "🚀 Starting Stock Verify Backend..."

# Load environment variables from .env.production if it exists
load_env() {
    if [ -f "$1" ]; then
        set -a
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip comments and empty lines
            [[ "$line" =~ ^[[:space:]]*# ]] && continue
            [[ -z "${line// }" ]] && continue
            
            # Export the variable properly, handling values with commas
            if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]}"
                value="${BASH_REMATCH[2]}"
                # Remove leading/trailing whitespace from value
                value="${value#"${value%%[![:space:]]*}"}"
                value="${value%"${value##*[![:space:]]}"}"
                # Remove quotes if present
                value="${value#\"}"
                value="${value%\"}"
                value="${value#\'}"
                value="${value%\'}"
                # Export the variable
                export "$key=$value"
            fi
        done < "$1"
        set +a
    fi
}

if [ -f .env.production ]; then
  echo "📋 Loading environment from .env.production"
  load_env .env.production
else
  echo "⚠️  .env.production not found. Using defaults."
  echo "   Run: bash setup-env.sh to create it"
fi

# Create necessary directories
mkdir -p logs
mkdir -p uploads
mkdir -p reports

# Start the server
echo "🚀 Starting server on port ${PORT:-3000}..."
bun run start
