# War Room CLI Integration Guide

## Overview

The War Room CLI has been fully integrated with the Organic Code Studio unified project, providing a seamless experience between command-line and web interfaces.

## Architecture

### Components

1. **War Room CLI** (`/warroom-cli`)
   - Standalone CLI application
   - WebSocket client for real-time communication
   - Code analysis and DAG generation utilities
   - Agent management system

2. **Web Interface** (`/src/components/warroom`)
   - React-based War Room component
   - WebSocket integration for real-time updates
   - Visual agent management
   - Session tracking and history

3. **Server Integration** (`/server/routes/warroom.js`)
   - WebSocket server for real-time communication
   - REST API endpoints for session management
   - Agent orchestration backend

## Key Features

### 1. Unified Session Management
- Sessions started in CLI appear in web interface
- Real-time synchronization via WebSocket
- Shared session history

### 2. Code Analysis Integration
```bash
# Analyze code and open DAG visualization
warroom analyze src/server.js -v

# Analyze entire folder with dependency mapping
warroom folder . -v
```

### 3. DAG Visualization
- CLI can trigger DAG visualization in web browser
- Support for file and folder analysis
- Automatic layout selection based on analysis type

### 4. Agent System
- 10 specialized AI agents available
- Dynamic team composition based on task
- Real-time agent status updates

## Installation

```bash
# Install main dependencies
npm install

# Install and setup War Room CLI
npm run install-cli
```

## Usage Examples

### Starting a Session from CLI
```bash
# Basic session
warroom start -t "Implement user authentication"

# With specific agents and web interface
warroom start -t "Refactor database layer" -a CodeAnalyzer RefactoringAgent --web
```

### Remote Collaboration
```bash
# Server side
npm run dev

# Client side
warroom connect -h server-ip -p 3005
```

### Folder Analysis with DAG
```bash
# Analyze project structure
warroom folder src -v

# With custom ignore patterns
warroom folder . -i "*.test.js" "node_modules" -v
```

## WebSocket Protocol

### Message Types

**Client → Server:**
- `register` - Register session with server
- `create-session` - Create new War Room session
- `list-sessions` - Get active sessions
- `join-session` - Join existing session
- `server-status` - Get server status

**Server → Client:**
- `session-update` - Session state changes
- `agent-message` - Agent communication
- `session-complete` - Session completion
- `error` - Error messages

### Example WebSocket Flow
```javascript
// Client connects
ws.send({ type: 'create-session', task: 'Implement feature X' })

// Server responds
ws.receive({ type: 'session-created', session: {...} })

// Agent updates
ws.receive({ type: 'agent-message', agent: 'CodeAnalyzer', message: '...' })
```

## API Endpoints

### REST API
- `POST /api/warroom/sessions` - Create session
- `GET /api/warroom/sessions` - List sessions
- `GET /api/warroom/sessions/:id` - Get session details
- `POST /api/warroom/sessions/:id/end` - End session
- `POST /api/warroom/sessions/:id/message` - Send agent message

### WebSocket
- `ws://localhost:3005/warroom-ws` - WebSocket endpoint

## Configuration

### Environment Variables
```env
PORT=3005              # Server port
WS_PORT=3005          # WebSocket port (same as server)
```

### CLI Configuration
The CLI uses the following defaults:
- Server: `localhost:3005`
- WebSocket: `ws://localhost:3005/warroom-ws`
- DAG Viewer: `http://localhost:5173/dag`

## Development

### Running in Development Mode
```bash
# Terminal 1: Start the unified app
npm run dev

# Terminal 2: Use the CLI
warroom start -t "Your task here"
```

### Testing WebSocket Connection
```bash
# Test connection
warroom connect

# In the CLI prompt
warroom-remote> status
warroom-remote> sessions
```

## Troubleshooting

### WebSocket Connection Issues
1. Ensure server is running on correct port
2. Check firewall settings
3. Verify WebSocket upgrade headers are allowed

### CLI Installation Issues
1. Ensure Node.js v18+ is installed
2. Check npm global bin path is in PATH
3. Try manual installation with `npm link`

### DAG Visualization Not Opening
1. Ensure Vite dev server is running
2. Check browser popup blockers
3. Verify port 5173 is not in use

## Future Enhancements

1. **Enhanced Agent Capabilities**
   - Machine learning-based agent selection
   - Custom agent creation framework

2. **Advanced Visualization**
   - 3D DAG visualization
   - Real-time code flow animation

3. **Collaboration Features**
   - Multi-user sessions
   - Voice/video integration
   - Shared code editing

4. **CLI Enhancements**
   - Plugin system
   - Custom command creation
   - Batch processing

## Contributing

To contribute to the War Room CLI integration:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT