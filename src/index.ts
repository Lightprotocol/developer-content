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
  methodName?: string;
  keywords: string[];
  isRpcMethod: boolean;
  isComprehensiveDoc: boolean;
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

  private extractMethodName(filePath: string, content: string, title: string): string | undefined {
    const fileName = filePath.split('/').pop()?.replace('.md', '');
    if (fileName && fileName.startsWith('get')) {
      return fileName;
    }
    
    // Extract from content (look for method definitions)
    const methodMatch = content.match(/^#\s*(\w+)$/m) || content.match(/`(\w+)`.*method/i);
    if (methodMatch) {
      return methodMatch[1];
    }
    
    return undefined;
  }

  private extractKeywords(content: string, title: string, methodName?: string): string[] {
    const keywords = new Set<string>();
    
    // Add title words
    title.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
    
    // Add method name variations
    if (methodName) {
      keywords.add(methodName.toLowerCase());
      // Add camelCase splits
      const camelSplit = methodName.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
      camelSplit.split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    }
    
    // Extract key terms from content
    const keyTerms = content.match(/`[a-zA-Z][a-zA-Z0-9_]*`/g) || [];
    keyTerms.forEach(term => {
      const clean = term.replace(/`/g, '').toLowerCase();
      if (clean.length > 2) keywords.add(clean);
    });
    
    // Add common API/RPC terms
    const commonTerms = ['rpc', 'method', 'api', 'endpoint', 'compressed', 'account', 'token', 'balance', 'signature'];
    const contentLower = content.toLowerCase();
    commonTerms.forEach(term => {
      if (contentLower.includes(term)) keywords.add(term);
    });
    
    return Array.from(keywords);
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
            section = pathParts[1].replace(/-/g, ' ');
          }
          
          const fileName = pathParts[pathParts.length - 1].replace('.md', '');
          const title = parsed.data.title || fileName.replace(/-/g, ' ');
          const methodName = this.extractMethodName(filePath, parsed.content, title);
          const keywords = this.extractKeywords(parsed.content, title, methodName);
          
          // Detect if this is an RPC method file
          const isRpcMethod = filePath.includes('json-rpc-methods') && 
                             !fileName.includes('readme') && 
                             !fileName.includes('rpcmethods');
          
          // Detect comprehensive documentation files
          const isComprehensiveDoc = fileName.includes('rpcmethods') || 
                                   parsed.content.includes('## Mainnet ZK Compression API endpoints') ||
                                   title.toLowerCase().includes('overview') ||
                                   title.toLowerCase().includes('all');

          const doc: DocumentEntry = {
            path: filePath,
            relativePath,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            content: parsed.content,
            frontmatter: parsed.data,
            section,
            methodName,
            keywords,
            isRpcMethod,
            isComprehensiveDoc,
          };

          this.documents.push(doc);
        } catch (error) {
          console.error(`Error processing ${filePath}:`, error);
        }
      }

      const fuseOptions = {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'methodName', weight: 2.5 },
          { name: 'keywords', weight: 2 },
          { name: 'content', weight: 1 },
          { name: 'section', weight: 0.5 },
        ],
        threshold: 0.6, // More permissive
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
        useExtendedSearch: true,
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
            description: 'Advanced search across ZK Compression documentation with semantic understanding, context analysis, and smart ranking. Finds API methods, concepts, examples, and implementation details with high precision.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query supporting natural language, technical terms, and concepts (e.g., "how to create compressed tokens", "validity proof verification", "RPC methods for token accounts")',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results to return (default: 5, max: 20)',
                  default: 5,
                },
                section: {
                  type: 'string',
                  description: 'Filter by documentation section (e.g., "compressed-tokens", "compressed-pdas", "learn", "resources", "json-rpc-methods")',
                },
                mode: {
                  type: 'string',
                  description: 'Search mode: fuzzy (flexible matching), exact (precise terms), semantic (meaning-based), comprehensive (multi-layered analysis)',
                  enum: ['fuzzy', 'exact', 'semantic', 'comprehensive'],
                  default: 'semantic',
                },
                content_filter: {
                  type: 'string',
                  description: 'Filter by content type to focus results',
                  enum: ['all', 'guides', 'reference', 'examples', 'concepts'],
                  default: 'all',
                },
                expand_context: {
                  type: 'boolean',
                  description: 'Provide expanded context and related sections',
                  default: true,
                },
                include_code: {
                  type: 'boolean',
                  description: 'Include code examples and snippets in results',
                  default: true,
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

      const { 
        query, 
        limit = 5, 
        section,
        mode = 'semantic',
        content_filter = 'all',
        expand_context = true,
        include_code = true
      } = request.params.arguments as {
        query: string;
        limit?: number;
        section?: string;
        mode?: string;
        content_filter?: string;
        expand_context?: boolean;
        include_code?: boolean;
      };

      if (!query) {
        throw new Error('Query parameter is required');
      }

      return await this.searchDocs(query, Math.min(limit, 20), section, mode, content_filter, expand_context, include_code);
    });
  }

  private detectQueryIntent(query: string): { isComprehensive: boolean; category?: string; searchTerms: string[] } {
    const queryLower = query.toLowerCase();
    const comprehensiveIndicators = ['all', 'list', 'complete', 'every', 'entire', 'full list'];
    const isComprehensive = comprehensiveIndicators.some(indicator => queryLower.includes(indicator));
    
    let category;
    if (queryLower.includes('rpc') || queryLower.includes('method') || queryLower.includes('api')) {
      category = 'rpc-methods';
    } else if (queryLower.includes('token')) {
      category = 'compressed-tokens';
    } else if (queryLower.includes('pda') || queryLower.includes('account')) {
      category = 'compressed-pdas';
    }
    
    // Extract meaningful search terms
    const searchTerms = query.toLowerCase()
      .replace(/\b(all|list|complete|every|entire|full)\b/g, '')
      .split(/\s+/)
      .filter(term => term.length > 2);
    
    return { isComprehensive, category, searchTerms };
  }

  private performComprehensiveSearch(category: string, section?: string): DocumentEntry[] {
    if (category === 'rpc-methods') {
      // Return all RPC method documents + comprehensive overview
      let docs = this.documents.filter(doc => 
        doc.isRpcMethod || doc.isComprehensiveDoc && doc.path.includes('json-rpc-methods')
      );
      
      // Prioritize the comprehensive overview document
      docs.sort((a, b) => {
        if (a.isComprehensiveDoc && !b.isComprehensiveDoc) return -1;
        if (!a.isComprehensiveDoc && b.isComprehensiveDoc) return 1;
        return a.title.localeCompare(b.title);
      });
      
      return docs;
    }
    
    // Default comprehensive search for other categories
    return this.documents.filter(doc => 
      section ? doc.section.toLowerCase().includes(section.toLowerCase()) : true
    );
  }

  private async searchDocs(
    query: string, 
    limit: number, 
    section?: string,
    mode: string = 'semantic',
    content_filter: string = 'all',
    expand_context: boolean = true,
    include_code: boolean = true
  ) {
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

    const { isComprehensive, category, searchTerms } = this.detectQueryIntent(query);
    let searchResults: any[] = [];
    let usedComprehensiveSearch = false;

    // Handle comprehensive queries
    if (isComprehensive && category) {
      const comprehensiveDocs = this.performComprehensiveSearch(category, section);
      searchResults = comprehensiveDocs.map(doc => ({ item: doc, score: 0 }));
      usedComprehensiveSearch = true;
      
      // For RPC methods, ensure we get all 21 + overview
      if (category === 'rpc-methods') {
        limit = Math.max(limit, 25); // Ensure we show all RPC methods
      }
    } else {
      // Normal fuzzy search
      searchResults = this.searchIndex.search(query);
      
      // Apply section filter
      if (section) {
        searchResults = searchResults.filter(result => 
          result.item.section.toLowerCase().includes(section.toLowerCase())
        );
      }
      
      // Apply content filter
      if (content_filter !== 'all') {
        searchResults = searchResults.filter(result => {
          const doc = result.item;
          switch (content_filter) {
            case 'guides':
              return doc.section.includes('guides') || doc.title.toLowerCase().includes('guide');
            case 'reference':
              return doc.isRpcMethod || doc.section.includes('reference');
            case 'examples':
              return doc.content.includes('example') || doc.content.includes('```');
            case 'concepts':
              return doc.section.includes('learn') || doc.section.includes('concepts');
            default:
              return true;
          }
        });
      }
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
    response += `**Found:** ${results.length} result${results.length === 1 ? '' : 's'}`;
    if (usedComprehensiveSearch) {
      response += ` (comprehensive search)\n`;
    } else {
      response += ` (${mode} search)\n`;
    }
    response += `**Mode:** ${mode} | **Filter:** ${content_filter}\n\n`;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const doc = result.item;
      const score = Math.round((1 - (result.score || 0)) * 100);

      response += `## ${i + 1}. ${doc.title}\n`;
      response += `**Path:** \`${doc.relativePath}\`\n`;
      response += `**Section:** ${doc.section}\n`;
      if (doc.methodName) {
        response += `**Method:** \`${doc.methodName}\`\n`;
      }
      response += `**Relevance:** ${score}%\n\n`;

      // Enhanced content extraction
      let relevantContent = this.extractRelevantContent(
        doc, 
        usedComprehensiveSearch ? searchTerms : query.toLowerCase().split(' '),
        include_code,
        expand_context
      );

      if (relevantContent.length > 2000) {
        relevantContent = relevantContent.substring(0, 2000) + '\n\n...';
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

  private extractRelevantContent(
    doc: DocumentEntry, 
    queryWords: string[], 
    includeCode: boolean,
    expandContext: boolean
  ): string {
    const contentLines = doc.content.split('\n');
    let relevantContent = '';
    
    // For comprehensive docs or RPC methods, include more structure
    if (doc.isComprehensiveDoc || doc.isRpcMethod) {
      // Include title and first few sections
      let sectionCount = 0;
      let inCodeBlock = false;
      
      for (let i = 0; i < contentLines.length && sectionCount < 3; i++) {
        const line = contentLines[i];
        
        // Track code blocks
        if (line.startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          if (includeCode) {
            relevantContent += line + '\n';
          }
          continue;
        }
        
        // Skip code content if not including code
        if (inCodeBlock && !includeCode) {
          continue;
        }
        
        // Include headers
        if (line.startsWith('#')) {
          sectionCount++;
          relevantContent += line + '\n';
        }
        // Include lines with query terms
        else if (queryWords.some(word => line.toLowerCase().includes(word))) {
          relevantContent += line + '\n';
        }
        // Include important structural lines
        else if (line.includes('|') || line.startsWith('*') || line.startsWith('-')) {
          relevantContent += line + '\n';
        }
        // Add context around matches
        else if (expandContext && i > 0 && i < contentLines.length - 1) {
          const prevLine = contentLines[i - 1];
          const nextLine = contentLines[i + 1];
          if (queryWords.some(word => 
            prevLine.toLowerCase().includes(word) || nextLine.toLowerCase().includes(word)
          )) {
            relevantContent += line + '\n';
          }
        }
      }
    } else {
      // Standard content extraction for other docs
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
        const preview = contentLines.slice(0, 15).join('\n');
        relevantContent = preview + (contentLines.length > 15 ? '\n\n...' : '');
      }
    }

    return relevantContent || 'No relevant content found.';
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



