---
description: Complete Guide to Mapping for LLMs for ZK Compression related topics.
hidden: true
---

# MCP Configuration

Mapping for developing with AI assistance and ZK Compression

Connect AI tools directly to ZK Compression documentation for contextual development assistance. Guide to complete MCP setup, troubleshooting and best practices.

* include all links to docs as llms.txt and .md
* link to repo
* link to mcp



#### [Setting up AI Tooling for Solana development](https://solana.com/docs/intro/installation#setting-up-ai-tooling-for-solana-development) <a href="#setting-up-ai-tooling-for-solana-development" id="setting-up-ai-tooling-for-solana-development"></a>

This section details optional AI tooling setup you can use to accelerate your Solana development.

## What is MCP?

MCP is an open standard that connects AI tools to external information sources in real-time. This provides better and more accurate assistance from AI tools like Claude, Cursor, or Windsurf.

## What can I use Light's MCP for? <a href="#how-helius-mcp-works" id="how-helius-mcp-works"></a>

The Light MCP server automatically provides AI tools with access to:

* **Complete API Documentation**: All ZK Compression API methods, parameters, and examples
* **Code Examples**: Working implementations for common use cases
* **Best Practices**: Recommended patterns for using ZK Compression
* **Real-time Updates**: Always current with the latest documentation changes

{% hint style="info" %}
**Automatic Sync**: Our MCP server is automatically generated from our documentation and GitHub specifications, ensuring it’s always up-to-date with the latest features and changes.
{% endhint %}

## Getting Started

{% stepper %}
{% step %}
### Confirm MCP Support of you AI tool

First, make sure your AI tool supports MCP. Popular options include:

* **Claude Desktop**: MCP server support
* **Claude Code:**&#x20;
* **Cursor**: built-in MCP support
* **Windsurf**: native MCP integration
* **VS Code**: via MCP extensions
{% endstep %}

{% step %}
### Add Light's MCP Server

Install Light Protocol's MCP server in your development environment:

```
// Some code
```

This automatically configures your MCP client access ZK Compression documentation and Light Protocol GitHub for AI assistance.
{% endstep %}

{% step %}
### Start developing with ZK Compression Context

Open your AI-powered IDE and start asking questions about ZK Compression. The AI will automatically query our MCP server for contextual documentation to help generate code.
{% endstep %}
{% endstepper %}

### Quick Test

{% tabs %}
{% tab title="Claude Desktop" %}
1. Install Claude Desktop
2. Run:&#x20;
3. Open Claude and ask: “Help me create compressed tokens.”
4. Get contextual responses with working code examples based on our documentation
{% endtab %}

{% tab title="Claude Code" %}

{% endtab %}

{% tab title="Cursor" %}
1. Open Cursor IDE
2. Open a terminal and run: `ADDCODE`&#x20;
3. Open Agent mode (Ctrl/Cmd + K)
4. Ask: “Write a Node.js script for creating compressed tokens.”
5. The AI will reference our documentation via MCP to generate accurate code
6. Watch as the AI generates working code using our docs and GitHub Repo
{% endtab %}

{% tab title="Windsurf" %}
1. Open Windsurf IDE
2. Run: `ADD CODE` in terminal
3. Open the AI assistant
4. Ask: “Help me create compressed tokens.”
5. The AI will reference our docs via MCP and generate code with proper imports and error handling
{% endtab %}
{% endtabs %}

### Best Practices

<table><thead><tr><th width="214"></th><th></th></tr></thead><tbody><tr><td><strong>Be Specific</strong></td><td>Ask specific questions like “How do I create compresssed tokens?”<br>rather than “Help with compressed tokens”</td></tr><tr><td><strong>Include Context</strong></td><td>Mention your tech stack: “Using Next.js and TypeScript, show me how to…”</td></tr><tr><td><strong>Test Generated Code</strong></td><td>Always test AI-generated code in your development environment</td></tr></tbody></table>

### Troubleshooting

<details>

<summary>MCP Server Not Found</summary>

**Issue**: AI tool can’t find Light Protocol's MCP server

**Solution**:

1. Re-run `add code`
2. Restart your AI tool
3. Check that MCP is enabled in your tool’s settings

</details>

<details>

<summary>Outdated Information</summary>

**Issue**: AI is providing outdated information

**Solution**:

1. The MCP server auto-updates, but you may need to refresh your AI session
2. Clear your AI tool’s cache if available
3. Ask specifically for “the latest” information

</details>

<details>

<summary>AI Generated Code Doesn't Work</summary>

**Issue**: AI-generated code has errors or doesn’t run

**Solution**:

1. Share the error message with the AI for debugging
2. Ask for error handling improvements
3. Verify your API key and network connectivity

</details>

## Example Workflows

<details>

<summary>Create and Transfer Compressed Tokens</summary>

```typescript
// Ask your AI: "Create and transfer compressed tokens using ZK Compression"
// The AI will generate something like this:


```

</details>

<details>

<summary>Create a Program with compressed PDAs</summary>

```rust
// Ask: "Build a  Program with compressed PDAs using ZK Compresion."
// Get working code with current method signatures:


```

</details>

## AI Tools with MCP Support

<table><thead><tr><th width="146">Tool</th><th width="169">Support Level</th><th width="144">Setup Difficulty</th><th>Best For</th></tr></thead><tbody><tr><td><strong>Claude Desktop</strong></td><td>Supported</td><td>Medium</td><td>Documentation and planning</td></tr><tr><td><strong>Claude Code</strong></td><td></td><td></td><td></td></tr><tr><td><strong>Cursor</strong></td><td>Native</td><td>Easy</td><td>Full-stack development</td></tr><tr><td><strong>Windsurf</strong></td><td>Native</td><td>Easy</td><td>AI-assisted coding</td></tr><tr><td><strong>VS Code</strong></td><td>Extension Required</td><td>Medium</td><td>Existing VS Code workflows</td></tr></tbody></table>

## Next Steps

Start building with ZK Compression using Light's MCP server, or get more help.

<table data-view="cards"><thead><tr><th></th><th></th><th data-hidden data-card-target data-type="content-ref"></th><th data-hidden data-card-cover data-type="image">Cover image</th><th data-hidden data-card-cover-dark data-type="image">Cover image (dark)</th></tr></thead><tbody><tr><td><h4>Explore Compressed Tokens</h4></td><td>Try our MCP with compressed Tokens.</td><td><a href="https://modelcontextprotocol.io/docs/getting-started/intro">https://modelcontextprotocol.io/docs/getting-started/intro</a></td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-31.png">Light Protocol v2 - Batched Merkle trees-31.png</a></td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-54.png">Light Protocol v2 - Batched Merkle trees-54.png</a></td></tr><tr><td><h4>Explore Compressed PDAs</h4></td><td>Try our MCP with compressed PDAs.</td><td></td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-33.png">Light Protocol v2 - Batched Merkle trees-33.png</a></td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-55.png">Light Protocol v2 - Batched Merkle trees-55.png</a></td></tr><tr><td><h4>Join Discord</h4></td><td>Get help from our developer community.</td><td></td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-50 (1).png">Light Protocol v2 - Batched Merkle trees-50 (1).png</a></td><td><a href="../.gitbook/assets/Light Protocol v2 - Batched Merkle trees-69.png">Light Protocol v2 - Batched Merkle trees-69.png</a></td></tr></tbody></table>
