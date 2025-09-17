import matter from 'gray-matter';
import Fuse from 'fuse.js';
import { SimpleMCPServer } from './mcp-server';

// Define worker environment interface
interface Env {
  // Add any environment variables or bindings here
}

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

// In-memory document storage for the ZK Compression docs
const compressionDocs = {
  "introduction.md": `# ZK Compression Introduction

Zero Knowledge (ZK) Compression is a revolutionary technology that enables significant cost reduction for storing data on Solana blockchain. By compressing state data and using validity proofs, developers can create applications with substantially lower storage costs while maintaining the security guarantees of the Solana blockchain.

## Key Benefits

- **Cost Efficiency**: Reduce storage costs by up to 5000x compared to traditional Solana accounts
- **Scalability**: Enable applications to store massive amounts of data economically
- **Security**: Maintain the same security guarantees as regular Solana accounts
- **Compatibility**: Works with existing Solana infrastructure and tools

## How It Works

ZK Compression uses merkle trees to store compressed account data off-chain while keeping only the merkle root on-chain. Validity proofs ensure that any state transitions are legitimate without requiring the full state to be stored on-chain.
`,
  "compressed-tokens/overview.md": `# Compressed Tokens Overview

Compressed tokens represent a new paradigm for token management on Solana, offering the same functionality as SPL tokens but with dramatically reduced storage costs.

## Features

- **Standard SPL Token Interface**: Compatible with existing SPL token tools and wallets
- **Massive Cost Savings**: Store token accounts for a fraction of the cost
- **High Throughput**: Support for millions of token holders without prohibitive costs
- **Batch Operations**: Efficient bulk operations for airdrops and mass transfers

## Use Cases

- Large-scale airdrops
- Gaming tokens and NFTs
- Loyalty programs
- Micropayments
- DeFi applications with many users
`,
  "compressed-pdas/overview.md": `# Compressed PDAs Overview

Compressed Program Derived Accounts (PDAs) extend the benefits of ZK compression to arbitrary program data, not just tokens.

## Benefits

- **Flexible Data Storage**: Store any type of program data efficiently
- **Program Compatibility**: Works with existing Solana programs with minimal changes
- **Developer Friendly**: Simple APIs for reading and writing compressed data
- **Cost Effective**: Reduce storage costs for program state

## Implementation

Compressed PDAs use the same underlying merkle tree technology as compressed tokens but provide a more general-purpose interface for arbitrary data storage.
`,
  "json-rpc-methods/getcompressedaccount.md": `# getCompressedAccount

Returns information about a compressed account.

## Parameters

- \`hash\` (string, required): The hash of the compressed account
- \`commitment\` (string, optional): The commitment level (finalized, confirmed, processed)

## Returns

Returns a compressed account object with the following fields:
- \`hash\`: The account hash
- \`data\`: The compressed account data
- \`owner\`: The program that owns this account
- \`lamports\`: The number of lamports in the account

## Example

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getCompressedAccount",
  "params": [
    "F8VvXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  ]
}
\`\`\`
`,
  "json-rpc-methods/getcompressedbalance.md": `# getCompressedBalance

Returns the compressed SOL balance of an account.

## Parameters

- \`pubkey\` (string, required): The public key of the account
- \`commitment\` (string, optional): The commitment level

## Returns

Returns the compressed balance in lamports.

## Example

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getCompressedBalance",
  "params": [
    "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
  ]
}
\`\`\`
`,
  "learn/core-concepts/nutshell.md": `# ZK Compression in a Nutshell

ZK Compression is Solana's approach to scaling state storage using zero-knowledge proofs and merkle trees.

## The Problem

Traditional Solana accounts require rent payments and consume valuable blockspace. As applications grow, storage costs become prohibitive.

## The Solution

ZK Compression moves account data off-chain into merkle trees while keeping merkle roots on-chain. Validity proofs ensure state transitions are legitimate.

## Key Components

1. **Merkle Trees**: Store compressed data efficiently
2. **Validity Proofs**: Ensure state transitions are valid
3. **RPC Indexer**: Provides fast access to compressed data
4. **State Trees**: Manage compressed account lifecycle
`,
  "resources/addresses-and-urls.md": `# Addresses and URLs

## Mainnet Endpoints

- **RPC Endpoint**: \`https://zk-compression.solana.com\`
- **WebSocket**: \`wss://zk-compression.solana.com\`

## Devnet Endpoints

- **RPC Endpoint**: \`https://devnet.zk-compression.solana.com\`
- **WebSocket**: \`wss://devnet.zk-compression.solana.com\`

## Program Addresses

- **Compression Program**: \`compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq\`
- **Account Compression Program**: \`BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY\`
- **Token Compression Program**: \`CComp6aMz1S9EgYm6oRLEETSc8PbV7Gm9LfMkFHWJhXa\`
`
};

class ZKCompressionMCPServer {
  private mcpServer: SimpleMCPServer;
  private documents: DocumentEntry[] = [];
  private searchIndex: Fuse<DocumentEntry> | null = null;

  constructor() {
    this.mcpServer = new SimpleMCPServer();
    this.initializeDocuments();
    this.setupTools();
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

  private initializeDocuments() {
    try {
      for (const [filePath, content] of Object.entries(compressionDocs)) {
        try {
          const parsed = matter(content);
          const relativePath = filePath;
          
          const pathParts = relativePath.split('/');
          let section = 'General';
          if (pathParts.length > 1) {
            section = pathParts[0].replace(/-/g, ' ');
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
        threshold: 0.6,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
        useExtendedSearch: true,
      };

      this.searchIndex = new Fuse(this.documents, fuseOptions);
      console.log(`Initialized search index with ${this.documents.length} documents`);
    } catch (error) {
      console.error('Error initializing documents:', error);
    }
  }

  private setupTools() {
    this.mcpServer.addTool(
      'search_docs',
      'Advanced search across ZK Compression documentation with semantic understanding, context analysis, and smart ranking. Finds API methods, concepts, examples, and implementation details with high precision.',
      {
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
      async (args) => {
        const { 
          query, 
          limit = 5, 
          section,
          mode = 'semantic',
          content_filter = 'all',
          expand_context = true,
          include_code = true
        } = args;

        if (!query) {
          throw new Error('Query parameter is required');
        }

        return await this.searchDocs(
          query, 
          Math.min(limit, 20), 
          section, 
          mode, 
          content_filter, 
          expand_context, 
          include_code
        );
      }
    );
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
      
      // For RPC methods, ensure we get all results
      if (category === 'rpc-methods') {
        limit = Math.max(limit, 25);
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

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle SSE endpoint for MCP communication
    if (url.pathname === '/sse') {
      return this.mcpServer.handleSSE(request);
    }
    
    // Handle the new Streamable HTTP transport
    if (url.pathname === '/mcp') {
      return this.mcpServer.handleHTTP(request);
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }
    
    // Default response with information about the MCP server
    return new Response(
      JSON.stringify({
        name: 'Light MCP Remote - ZK Compression Documentation Search',
        version: '1.0.0',
        description: 'Remote MCP server providing ZK Compression documentation search',
        endpoints: {
          sse: '/sse',
          mcp: '/mcp',
          health: '/health'
        },
        tools: ['search_docs']
      }, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

// Create the MCP server instance
const zkCompressionServer = new ZKCompressionMCPServer();

// Export the default handler for Cloudflare Workers
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return zkCompressionServer.handleRequest(request);
  }
};