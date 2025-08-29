#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { glob } from 'glob';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import Fuse from 'fuse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

interface DocumentEntry {
  path: string;
  relativePath: string;
  title: string;
  content: string;
  frontmatter: any;
  section: string;
}

class ZKCompressionDocsServer {
  private server: Server;
  private documents: DocumentEntry[] = [];
  private searchIndex: Fuse<DocumentEntry> | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'light-mcp',
        version: '1.1.1',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.initializeDocuments();
  }

  private async initializeDocuments() {
    try {
      const markdownFiles = await glob('compression-docs/**/*.md', {
        cwd: PROJECT_ROOT,
        absolute: true,
      });

      console.error(`Found ${markdownFiles.length} markdown files`);

      for (const filePath of markdownFiles) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          const parsed = matter(content);
          const relativePath = relative(PROJECT_ROOT, filePath);
          
          const pathParts = relativePath.split('/');
          let section = 'General';
          if (pathParts.length > 1) {
            section = pathParts[1];
          }
          if (pathParts.length > 2) {
            section = `${pathParts[1]}/${pathParts[2]}`;
          }
          const title = parsed.data.title || 
                       pathParts[pathParts.length - 1].replace('.md', '').replace(/-/g, ' ');

          const doc: DocumentEntry = {
            path: filePath,
            relativePath,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            content: parsed.content,
            frontmatter: parsed.data,
            section,
          };

          this.documents.push(doc);
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error);
        }
      }

      const fuseOptions = {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'content', weight: 1 },
          { name: 'section', weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 3,
      };

      this.searchIndex = new Fuse(this.documents, fuseOptions);
      console.error(`Initialized search index with ${this.documents.length} documents`);
    } catch (error) {
      console.error('Error initializing documents:', error);
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_docs',
            description: 'Search ZK Compression documentation for relevant information. Use this when building with Solana ZK Compression to find API methods, concepts, examples, and implementation details.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query (e.g., "compressed tokens", "RPC methods", "state trees", "validity proofs")',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 5)',
                  default: 5,
                },
                section: {
                  type: 'string',
                  description: 'Filter by documentation section (e.g., "developers", "learn", "json-rpc-methods")',
                },
              },
              required: ['query'],
            },
          } as Tool,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'search_docs') {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const { query, limit = 5, section } = request.params.arguments as {
        query: string;
        limit?: number;
        section?: string;
      };

      if (!query) {
        throw new Error('Query parameter is required');
      }

      return await this.searchDocs(query, limit, section);
    });
  }

  private async searchDocs(query: string, limit: number, section?: string) {
    if (!this.searchIndex) {
      return {
        content: [
          {
            type: 'text',
            text: 'Search index not initialized. Please wait for the server to finish loading.',
          },
        ],
      };
    }

    let searchResults = this.searchIndex.search(query);

    if (section) {
      searchResults = searchResults.filter(result => 
        result.item.section.toLowerCase().includes(section.toLowerCase())
      );
    }

    const results = searchResults.slice(0, limit);

    if (results.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No results found for "${query}"${section ? ` in section "${section}"` : ''}`,
          },
        ],
      };
    }

    let response = `# ZK Compression Documentation Search Results\n\n`;
    response += `**Query:** "${query}"\n`;
    response += `**Found:** ${results.length} result${results.length === 1 ? '' : 's'}\n\n`;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const doc = result.item;
      const score = Math.round((1 - (result.score || 0)) * 100);

      response += `## ${i + 1}. ${doc.title}\n`;
      response += `**Path:** \`${doc.relativePath}\`\n`;
      response += `**Section:** ${doc.section}\n`;
      response += `**Relevance:** ${score}%\n\n`;

      const contentLines = doc.content.split('\n');
      const queryWords = query.toLowerCase().split(' ');
      let relevantContent = '';
      let currentParagraph = '';
      let foundRelevantContent = false;

      for (const line of contentLines) {
        if (line.trim() === '') {
          if (currentParagraph.trim() && queryWords.some(word => 
            currentParagraph.toLowerCase().includes(word)
          )) {
            relevantContent += currentParagraph + '\n\n';
            foundRelevantContent = true;
          }
          currentParagraph = '';
        } else {
          currentParagraph += line + '\n';
        }
      }

      if (currentParagraph.trim() && queryWords.some(word => 
        currentParagraph.toLowerCase().includes(word)
      )) {
        relevantContent += currentParagraph + '\n\n';
        foundRelevantContent = true;
      }

      if (!foundRelevantContent) {
        const preview = contentLines.slice(0, 10).join('\n');
        relevantContent = preview + (contentLines.length > 10 ? '\n\n...' : '');
      }

      if (relevantContent.length > 1500) {
        relevantContent = relevantContent.substring(0, 1500) + '\n\n...';
      }

      response += '```markdown\n' + relevantContent.trim() + '\n```\n\n';
      response += '---\n\n';
    }

    return {
      content: [
        {
          type: 'text',
          text: response,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Light MCP server running');
  }
}

const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule) {
  const server = new ZKCompressionDocsServer();
  server.run().catch(console.error);
}

export { ZKCompressionDocsServer };
export default ZKCompressionDocsServer;

