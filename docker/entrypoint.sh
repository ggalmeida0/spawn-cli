#!/bin/bash
set -e

# Required environment variables
: ${REPO_URL:?"REPO_URL environment variable is required"}
: ${PROMPT:?"PROMPT environment variable is required"}
: ${CLAUDE_API_KEY:?"CLAUDE_API_KEY environment variable is required"}

# Optional environment variables with defaults
BRANCH=${BRANCH:-"main"}
REPO_DIR="/workspace/repo"

echo "🚀 Starting Claude worker..."
echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"
echo "Prompt: $PROMPT"

# Clone repository
echo "📦 Cloning repository..."
git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$REPO_DIR"
cd "$REPO_DIR"

echo "📁 Repository cloned to: $(pwd)"
echo "📋 Repository contents:"
ls -la

# Set up Claude CLI with API key
export ANTHROPIC_API_KEY="$CLAUDE_API_KEY"

# Execute Claude CLI with the prompt
echo "🤖 Starting Claude CLI with prompt..."
echo "Prompt: $PROMPT"

# For now, simulate Claude CLI execution
# TODO: Replace with actual Claude CLI command
echo "=== CLAUDE CLI OUTPUT ==="
echo "This is a simulated Claude CLI response for prompt: $PROMPT"
echo "Working on repository: $REPO_URL"
echo "In directory: $(pwd)"
echo "Files available:"
find . -type f -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.md" | head -10
echo "=== END CLAUDE CLI OUTPUT ==="

# Keep container running if in interactive mode
if [ "$INTERACTIVE" = "true" ]; then
    echo "💬 Interactive mode - container will stay running"
    echo "You can connect with: docker exec -it <container_id> /bin/bash"
    tail -f /dev/null
else
    echo "✅ Claude worker completed"
fi