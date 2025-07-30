FROM alpine:3.18

# Install system dependencies
RUN apk add --no-cache \
    bash \
    git \
    curl \
    nodejs \
    npm

# Create workspace directory
WORKDIR /workspace

# Install Claude CLI globally (placeholder - we'll need the actual installation method)
# For now, we'll simulate with a simple script
RUN npm install -g @anthropic/claude-cli || echo "Claude CLI installation placeholder"

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]