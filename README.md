# Unofficial Jules MCP Server

[![npm version](https://img.shields.io/npm/v/jules-mcp-server.svg)](https://npmjs.org/package/jules-mcp-server)

`jules-mcp-server` connects your AI coding assistant (such as Claude, Cursor, or Copilot) to the [Jules API](https://jules.ai), enabling autonomous coding sessions directly from your IDE. It acts as a Model Context Protocol (MCP) server, giving your AI assistant the ability to create coding sessions, manage tasks, and interact with Jules agents for automated software development.

## [Changelog](./CHANGELOG.md) | [Troubleshooting](#troubleshooting)

## Key features

- **Autonomous coding sessions**: Create and manage Jules coding sessions directly from your AI assistant
- **GitHub integration**: Connect to your GitHub repositories through Jules sources
- **Plan approval workflow**: Review and approve execution plans before Jules makes changes
- **Real-time activity tracking**: Monitor session progress and view detailed activity logs
- **Type-safe validation**: Runtime validation with Zod ensures all inputs are validated before API calls
- **Streamable HTTP transport**: Uses the MCP Streamable HTTP specification for reliable communication

## Disclaimers

`jules-mcp-server` provides your MCP client with access to create and manage coding sessions in your connected GitHub repositories. Ensure you review and approve plans before execution, especially in production repositories. The server requires a valid Jules API key with appropriate permissions.

## Requirements

- [Node.js](https://nodejs.org/) v18 or newer
- [Jules API account](https://developers.google.com/jules/api) with API key
- [npm](https://www.npmjs.com/)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/yourusername/jules-mcp-server.git
cd jules-mcp-server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and add your JULES_API_KEY
```

Your `.env` file should contain:

```bash
JULES_API_KEY=your_api_key_here
PORT=3323
HOST=127.0.0.1
```

### 3. Start the server

```bash
npm run dev
# Server starts at http://127.0.0.1:3323/mcp
```

For production:

```bash
npm run build
npm run start:node
```

### 4. Configure your MCP client

Add the following config to your MCP client:

```json
{
  "mcpServers": {
    "jules": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3323/mcp"
    }
  }
}
```

> [!IMPORTANT]  
> The Jules MCP server uses **Streamable HTTP** transport and must be running before connecting your MCP client. Unlike stdio-based servers, this server runs as a persistent HTTP service.

### MCP Client configuration

<details>
  <summary>Claude Desktop</summary>

Edit your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the Jules server configuration:

```json
{
  "mcpServers": {
    "jules": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3323/mcp"
    }
  }
}
```

Restart Claude Desktop after saving the configuration.

</details>

<details>
  <summary>Cursor</summary>

**Manual installation:**

1. Go to `Cursor Settings` → `Features` → `MCP`
2. Click `Add new global MCP server`
3. Add the configuration:

```json
{
  "mcpServers": {
    "jules": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3323/mcp"
    }
  }
}
```

4. Restart Cursor

> [!NOTE]  
> Make sure the Jules MCP server is running before starting Cursor. The server uses stateless mode for optimal Cursor compatibility.

</details>

<details>
  <summary>VS Code / Copilot</summary>

Follow the MCP installation [guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server) and use the configuration provided above.

> [!NOTE]  
> Streamable HTTP support may vary by MCP client version. Ensure you're using a recent version that supports the `streamable-http` transport type.

</details>

<details>
  <summary>Other MCP Clients</summary>

For other MCP clients that support Streamable HTTP transport, use the configuration provided above. Ensure the client supports:

- MCP protocol version `2024-11-05` or newer
- Streamable HTTP transport (`type: "streamable-http"`)
- Stateless mode (no session management required)

</details>

### Your first prompt

Enter the following prompt in your MCP client to verify the setup:

```
List my Jules sources
```

Your MCP client should call the `jules_list_sources` tool and display your connected GitHub repositories.

To create a coding session:

```
Create a Jules session for sources/github/owner/repo with the prompt "Add a README file"
```

> [!TIP]  
> Use `requirePlanApproval: true` when creating sessions to review changes before Jules executes them.

## Tools

All tools include runtime validation with Zod for type safety and clear error messages.

<!-- BEGIN TOOLS LIST -->

* **Session management** (3 tools)
  * `jules_create_session` - Create a new Jules coding session
  * `jules_list_sessions` - List all your Jules sessions
  * `jules_send_message` - Send a message to an active Jules agent

* **Plan approval** (1 tool)
  * `jules_approve_plan` - Approve a session's execution plan

* **Monitoring** (2 tools)
  * `jules_list_sources` - List your connected GitHub sources
  * `jules_list_activities` - List activities for a session

<!-- END TOOLS LIST -->

### Tool details

#### `jules_list_sources`
List your connected GitHub sources.

**Parameters:**
- `pageSize` (optional): Number of items per page (1-100)
- `pageToken` (optional): Token for pagination

#### `jules_create_session`
Create a new Jules coding session.

**Parameters:**
- `prompt` (required): The task prompt for Jules (1-10000 characters)
- `source` (required): Source path, e.g., `sources/github/owner/repo`
- `title` (optional): Session title (1-200 characters)
- `startingBranch` (optional): Git branch to start from (default: `main`)
- `requirePlanApproval` (optional): Whether to require plan approval before execution (default: `false`)

#### `jules_list_sessions`
List all your Jules sessions.

**Parameters:**
- `pageSize` (optional): Number of items per page (1-100)
- `pageToken` (optional): Token for pagination

#### `jules_approve_plan`
Approve a session's execution plan.

**Parameters:**
- `sessionId` (required): The session ID to approve, format: `sessions/{id}`

#### `jules_send_message`
Send a message to an active Jules agent.

**Parameters:**
- `sessionId` (required): The session ID, format: `sessions/{id}`
- `prompt` (required): The message to send (1-10000 characters)

#### `jules_list_activities`
List activities for a session.

**Parameters:**
- `sessionId` (required): The session ID, format: `sessions/{id}`
- `pageSize` (optional): Number of items per page (1-100)
- `pageToken` (optional): Token for pagination

## Resources

The server provides two MCP resources for additional context:

* **`jules://sources`** - Your connected GitHub sources
* **`jules://sessions/{id}/activities`** - Latest activities for a specific session

Resources can be accessed directly by MCP clients for context gathering.

## Configuration

The Jules MCP server supports the following environment variables:

<!-- BEGIN CONFIGURATION -->

* **`JULES_API_KEY`** (required)
  Your Jules API key for authentication.
  * **Type:** string

* **`PORT`**
  Port number for the HTTP server.
  * **Type:** number
  * **Default:** `3323`

* **`HOST`**
  Host address to bind the server to.
  * **Type:** string
  * **Default:** `127.0.0.1`

* **`ALLOWED_ORIGINS`**
  Comma-separated list of allowed origins for CORS.
  * **Type:** string
  * **Default:** `null,http://localhost`

<!-- END CONFIGURATION -->

Configure these in your `.env` file:

```bash
JULES_API_KEY=your_api_key_here
PORT=3323
HOST=127.0.0.1
ALLOWED_ORIGINS=null,http://localhost
```

## Architecture

### Stateless mode

The server runs in **stateless mode** (no session management) for optimal compatibility with MCP clients like Cursor. Each request is independent and doesn't require session ID headers.

### Transport

Uses the MCP **Streamable HTTP** transport specification with:
- JSON responses enabled (`enableJsonResponse: true`)
- No session management (`sessionIdGenerator: undefined`)
- CORS protection with configurable origins
- Request/response logging for debugging

### Validation

All tool inputs are validated using Zod schemas before making API calls:
- Prevents invalid requests from reaching the Jules API
- Provides clear, actionable error messages
- Saves API quota by catching errors early
- Ensures type safety throughout the request pipeline

See [VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md) for detailed validation rules and examples.

## Troubleshooting

### Server won't start

**Problem:** Server fails to start or crashes immediately.

**Solutions:**
- Verify `JULES_API_KEY` is set in `.env`
- Check that port 3323 is not already in use: `netstat -ano | findstr :3323` (Windows) or `lsof -i :3323` (macOS/Linux)
- Ensure Node.js version is 18 or newer: `node --version`
- Check server logs for specific error messages

### Cursor shows "No tools"

**Problem:** MCP connection appears to work, but no tools are listed.

**Solutions:**
- Verify the server is running: `curl http://127.0.0.1:3323/mcp` should not return connection errors
- Restart Cursor after making configuration changes
- Check that the URL in your config is exactly `http://127.0.0.1:3323/mcp`
- Ensure the server is using stateless mode (default configuration)
- Try restarting the server: stop it and run `npm run dev` again

### CORS/Origin errors

**Problem:** Server returns 403 Forbidden Origin errors.

**Solutions:**
- Add `null` to `ALLOWED_ORIGINS` in `.env` for local development
- For custom origins, update `ALLOWED_ORIGINS`: `ALLOWED_ORIGINS=null,http://localhost,http://127.0.0.1`
- Restart the server after changing environment variables

### Validation errors

**Problem:** Tool calls fail with validation errors.

**Solutions:**
- Check the error message for specific field requirements
- Verify session IDs match the format `sessions/{id}`
- Verify source paths match the format `sources/github/owner/repo`
- Ensure string lengths are within specified limits
- See [VALIDATION_EXAMPLES.md](./VALIDATION_EXAMPLES.md) for correct input formats

### API authentication errors

**Problem:** Tools fail with 401 Unauthorized errors.

**Solutions:**
- Verify your `JULES_API_KEY` is valid and active
- Check that the API key has the necessary permissions
- Ensure the `.env` file is in the project root directory
- Restart the server after updating the API key

### Connection timeouts

**Problem:** Requests to Jules API timeout or hang.

**Solutions:**
- Check your internet connection
- Verify Jules API status at [status.jules.ai](https://status.jules.ai) (if available)
- Increase timeout values if working with large repositories
- Check firewall settings that might block outgoing HTTPS requests

## Development

### Building from source

```bash
npm install
npm run build
```

The TypeScript source in `src/` compiles to JavaScript in `dist/`.

### Running in development mode

```bash
npm run dev
```

This uses `tsx` to run TypeScript directly with hot reloading.

### Project structure

```
jules-mcp-server/
├── src/
│   ├── server.ts           # Main server and MCP setup
│   ├── client/
│   │   └── jules-client.ts # Jules API client
│   ├── tools/
│   │   ├── index.ts        # Tool registry
│   │   ├── sources.ts      # Source management tools
│   │   ├── sessions.ts     # Session management tools
│   │   └── activities.ts   # Activity monitoring tools
│   ├── schemas/
│   │   └── index.ts        # Zod validation schemas
│   ├── resources/
│   │   └── index.ts        # MCP resources
│   └── types/
│       └── tool.ts         # Type definitions
├── dist/                   # Compiled JavaScript
├── .env                    # Environment configuration
└── package.json
```

## Known limitations

### Streamable HTTP client support

Not all MCP clients fully support the Streamable HTTP transport. This server is tested with:
- ✅ Cursor (stateless mode)
- ✅ Claude Desktop (with manual configuration)
- ⚠️ VS Code/Copilot (limited support, check version)

### Session management

The server uses stateless mode for compatibility. If you need stateful session management, you can modify `src/server.ts` to enable `sessionIdGenerator`, but this may break compatibility with some clients like Cursor.

### Local-only access

By default, the server binds to `127.0.0.1` (localhost only) for security. To allow remote access, change the `HOST` environment variable, but ensure you implement proper authentication and use HTTPS in production.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/jules-mcp-server/issues)
- **Jules API:** [jules API](https://developers.google.com/jules/api)
- **MCP Specification:** [modelcontextprotocol.io](https://modelcontextprotocol.io)