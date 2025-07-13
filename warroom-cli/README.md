# War Room CLI

AI-powered collaborative development command line interface for the Organic Code Studio.

## Installation

```bash
# Clone the repository and navigate to warroom-cli
cd warroom-cli

# Run the installer
./install.sh

# Or install manually
npm install
npm link
```

## Requirements

- Node.js v18 or higher
- npm or yarn

## Quick Start

```bash
# Start a new War Room session
warroom start

# Start with specific task
warroom start -t "Implement user authentication"

# Open web interface along with session
warroom start -t "Refactor database layer" --web
```

## Commands

### `warroom start`
Start a new War Room session with AI agents.

Options:
- `-t, --task <description>` - Task description
- `-a, --agents <agents...>` - Specific agents to use
- `-w, --web` - Open web interface

Example:
```bash
warroom start -t "Implement REST API" -a CodeAnalyzer TestGenerator
```

### `warroom analyze <path>`
Analyze code file or directory.

Options:
- `-d, --depth <number>` - Analysis depth (default: 2)
- `-v, --visualize` - Open DAG visualization
- `-o, --output <file>` - Output results to file

Example:
```bash
warroom analyze src/server.js -v
warroom analyze ./src -d 3 -o analysis.json
```

### `warroom folder <path>`
Analyze entire folder structure and dependencies.

Options:
- `-i, --ignore <patterns...>` - Patterns to ignore (default: node_modules, .git)
- `-d, --depth <number>` - Maximum depth (default: 5)
- `-v, --visualize` - Open DAG visualization

Example:
```bash
warroom folder . -v
warroom folder src -i "*.test.js" "dist"
```

### `warroom dag [file]`
Open DAG visualizer for code analysis.

Options:
- `-p, --port <number>` - Port to use (default: 5173)
- `-a, --analyze` - Analyze before opening

Example:
```bash
warroom dag
warroom dag src/main.js -a
```

### `warroom agents`
List available War Room agents and their capabilities.

Options:
- `-c, --capabilities` - Show detailed agent capabilities

Example:
```bash
warroom agents -c
```

### `warroom connect`
Connect to running War Room server for remote control.

Options:
- `-h, --host <host>` - Server host (default: localhost)
- `-p, --port <port>` - Server port (default: 3001)

Example:
```bash
warroom connect
warroom connect -h 192.168.1.100 -p 3005
```

## Available Agents

- **SessionOrchestrator** - Manages team composition and session flow
- **AIDialogModerator** - Facilitates conversation and resolves conflicts
- **ValidationPipeline** - Ensures quality and correctness
- **CodeAnalyzer** - Analyzes code structure and patterns
- **RequirementsAnalyzer** - Extracts and validates requirements
- **TestGenerator** - Creates test cases and validation
- **DocumentationGenerator** - Generates documentation
- **RefactoringAgent** - Suggests code improvements
- **SecurityAuditor** - Detects security vulnerabilities
- **PerformanceOptimizer** - Analyzes performance bottlenecks

## Integration with Web Interface

The War Room CLI seamlessly integrates with the Organic Code Studio web interface:

1. **Real-time sync** - CLI and web sessions stay synchronized
2. **WebSocket communication** - Live updates between CLI and web
3. **Shared visualization** - DAG views work across both interfaces
4. **Session handoff** - Start in CLI, continue in web (and vice versa)

## Examples

### Complex Task with Multiple Agents
```bash
warroom start -t "Refactor authentication system with better security" \
  -a SessionOrchestrator CodeAnalyzer SecurityAuditor RefactoringAgent \
  --web
```

### Full Project Analysis
```bash
# Analyze entire project and visualize
warroom folder . -v

# Export analysis results
warroom folder src -o project-analysis.json
```

### Remote Collaboration
```bash
# On server machine
npm run dev  # Start the web server

# On client machine
warroom connect -h server-ip -p 3005
```

## Troubleshooting

### Connection Issues
If you can't connect to the War Room server:
1. Ensure the server is running (`npm run dev`)
2. Check firewall settings
3. Verify the correct host and port

### Installation Issues
If global command doesn't work:
1. Check npm prefix: `npm config get prefix`
2. Ensure the prefix/bin is in your PATH
3. Try using npx: `npx warroom start`

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## License

MIT