// Basic MCP Server implementation for Cloudflare Workers
// Based on the Model Context Protocol specification

interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPRequest extends MCPMessage {
  method: string;
  params?: any;
}

interface MCPResponse extends MCPMessage {
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

export class SimpleMCPServer {
  private tools: Map<string, Tool> = new Map();
  private toolHandlers: Map<string, (args: any) => Promise<any>> = new Map();

  addTool(name: string, description: string, inputSchema: any, handler: (args: any) => Promise<any>) {
    this.tools.set(name, { name, description, inputSchema });
    this.toolHandlers.set(name, handler);
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: 'light-mcp-remote',
                version: '1.0.0',
              },
            },
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              tools: Array.from(this.tools.values()),
            },
          };

        case 'tools/call':
          const toolName = request.params?.name;
          const toolArgs = request.params?.arguments || {};
          
          if (!this.toolHandlers.has(toolName)) {
            return {
              jsonrpc: '2.0',
              id: request.id,
              error: {
                code: -32601,
                message: `Tool '${toolName}' not found`,
              },
            };
          }

          const handler = this.toolHandlers.get(toolName)!;
          const result = await handler(toolArgs);
          
          return {
            jsonrpc: '2.0',
            id: request.id,
            result,
          };

        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: `Method '${request.method}' not found`,
            },
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  // Handle SSE connections for MCP (simplified to avoid hanging)
  async handleSSE(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
        },
      });
    }

    // For GET requests, return basic SSE setup
    if (request.method === 'GET') {
      const encoder = new TextEncoder();
      const body = encoder.encode('data: {"type":"connection","status":"ready"}\n\n');
      
      return new Response(body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control',
        },
      });
    }

    // Handle POST requests with MCP messages
    if (request.method === 'POST') {
      try {
        const body = await request.text();
        const mcpRequest: MCPRequest = JSON.parse(body);
        const mcpResponse = await this.handleRequest(mcpRequest);
        
        return new Response(JSON.stringify(mcpResponse), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } catch (error) {
        const errorResponse = {
          jsonrpc: '2.0' as const,
          error: {
            code: -32700,
            message: 'Parse error',
            data: error instanceof Error ? error.message : String(error),
          },
        };
        
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  // Handle regular HTTP requests for MCP
  async handleHTTP(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method === 'POST') {
      try {
        const body = await request.text();
        const mcpRequest: MCPRequest = JSON.parse(body);
        const mcpResponse = await this.handleRequest(mcpRequest);
        
        return new Response(JSON.stringify(mcpResponse), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      } catch (error) {
        const errorResponse = {
          jsonrpc: '2.0' as const,
          error: {
            code: -32700,
            message: 'Parse error',
            data: error instanceof Error ? error.message : String(error),
          },
        };
        
        return new Response(JSON.stringify(errorResponse), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    return new Response('Method not allowed', { status: 405 });
  }
}
