# Spawn CLI

> CLI tool for spawning Claude agents in Docker containers

**⚠️ Early Development**: This project is in early development (v0.1.0). Core functionality is being built.

## Overview

Spawn CLI enables you to create isolated Docker environments where Claude agents can work on specific tasks within your repositories. Each "worker" gets a fresh container with your repo and a specific prompt/task.

## Architecture

- **Projects**: Reusable configurations that define repository, branch, Docker image, and environment variables
- **Workers**: Individual Claude agents spawned within project containers with specific prompts

## Installation

```bash
# Clone and install
git clone <repo-url>
cd spawn
npm install
npm run build

# Test locally
./bin/spawn --help
```

## Usage

### Project Management

```bash
# Create a project
spawn project create my-app --repo https://github.com/user/my-app.git

# Create with custom settings
spawn project create backend \
  --repo https://github.com/user/backend.git \
  --branch develop \
  --image claude-cli:latest \
  --env API_KEY=test123

# List projects
spawn project list

# Show project details
spawn project show my-app

# Delete project
spawn project delete my-app
```

### Worker Management (Coming Soon)

```bash
# Create worker with inline prompt
spawn worker create --project my-app --prompt "Add user authentication"

# Create worker with editor prompt
spawn worker create --project my-app  # Opens $EDITOR

# Run in background
spawn worker create --project my-app --prompt "Fix bug #123" --detached

# Manage workers
spawn worker list
spawn worker connect <worker-id>
spawn worker logs <worker-id> --follow
spawn worker destroy <worker-id>
```

## Current Status

✅ **Project Management** - Create, list, show, delete projects  
✅ **CLI Framework** - Command structure and help system  
✅ **Data Persistence** - Local configuration storage  
🚧 **Docker Integration** - Worker creation and management (in progress)  
🚧 **Claude Integration** - Agent spawning and communication (planned)  

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Test
./bin/spawn project create test --repo https://github.com/user/test.git
```

## Technology Stack

- **TypeScript** - Type-safe development
- **Commander.js** - CLI framework
- **Dockerode** - Docker API integration
- **Conf** - Configuration management
- **Chalk/Ora** - Terminal UI

## Contributing

This project is in early development. Core Docker and Claude integration features are being built.

## License

MIT