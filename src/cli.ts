#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CURSOR_CONFIG_PATH = join(homedir(), '.cursor', 'mcp.json');
const CURSOR_DIR = dirname(CURSOR_CONFIG_PATH);

function ensureCursorDir() {
  if (!existsSync(CURSOR_DIR)) {
    mkdirSync(CURSOR_DIR, { recursive: true });
    console.error('Created .cursor directory');
  }
}

function readCursorConfig() {
  if (!existsSync(CURSOR_CONFIG_PATH)) {
    return { mcpServers: {} };
  }
  
  try {
    const content = readFileSync(CURSOR_CONFIG_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Invalid mcp.json, creating new one');
    return { mcpServers: {} };
  }
}

function writeCursorConfig(config: any) {
  writeFileSync(CURSOR_CONFIG_PATH, JSON.stringify(config, null, 2));
}

function installMCP() {
  console.error('Installing Light MCP for ZK Compression documentation...');
  
  ensureCursorDir();
  
  const config = readCursorConfig();
  
  // Add or update the light-mcp server
  config.mcpServers = config.mcpServers || {};
  config.mcpServers['light-mcp'] = {
    command: 'npx',
    args: ['-y', 'light-mcp']
  };
  
  writeCursorConfig(config);
  
  console.error('Light MCP installed successfully.');
  console.error(`Configuration saved to: ${CURSOR_CONFIG_PATH}`);
  console.error('Please restart Cursor to load the MCP server.');
}

function uninstallMCP() {
  console.error('Uninstalling Light MCP...');
  
  if (!existsSync(CURSOR_CONFIG_PATH)) {
    console.error('No Cursor MCP configuration found.');
    return;
  }
  
  const config = readCursorConfig();
  
  if (config.mcpServers && config.mcpServers['light-mcp']) {
    delete config.mcpServers['light-mcp'];
    writeCursorConfig(config);
    console.error('Light MCP removed from Cursor configuration.');
    console.error('Please restart Cursor to apply changes.');
  } else {
    console.error('Light MCP was not found in configuration.');
  }
}

function showHelp() {
  console.error('Light MCP - ZK Compression Documentation Search');
  console.error('');
  console.error('Usage:');
  console.error('  npx light-mcp install     Install Light MCP in Cursor');
  console.error('  npx light-mcp uninstall   Remove Light MCP from Cursor');
  console.error('  npx light-mcp              Run MCP server (used by Cursor)');
  console.error('  npx light-mcp --help       Show this help');
}

async function startMCPServer() {
  // Import and start the MCP server
  const { default: ZKCompressionDocsServer } = await import('./index.js');
  const server = new ZKCompressionDocsServer();
  await server.run();
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('install')) {
    installMCP();
  } else if (args.includes('uninstall')) {
    uninstallMCP();
  } else if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  } else if (args.length === 0) {
    // No args = run MCP server (this is what Cursor calls)
    startMCPServer();
  } else {
    console.error('Unknown command. Use --help for usage information.');
    process.exit(1);
  }
}

main();
