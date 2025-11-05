---
title: AI Tools Guide
description: Guidance to AI tools when working with ZK Compression. Includes MCP server, DeepWiki, and AI Search guides.
---

# For Docs

* **Docs AI Search** - Search documentation with AI in the search bar.
* **llms.txt** - Site index for LLM navigation: [https://zkcompression.com/llms.txt](https://zkcompression.com/llms.txt).
* **Markdown Export** - Append `.md` to any page URL for raw markdown.

# **For Development**

## DeepWiki [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol)

Use DeepWiki and its search capabilities (AskDevin) to query the Light Protocol repository in natural language.

* DeepWiki generates systematic documentatio&#x6E;_._
* Use AskDevin for help with _debugging and technical questions_:

{% embed url="https://drive.google.com/file/d/1irbZC4NpSE6F1XctIel0yXyVmwvRsjaU/view?usp=share_link" %}

{% hint style="info" %}
You can index and query any public GitHub repository with DeepWiki to produce wikis with architecture diagrams, source links, and codebase summaries.
{% endhint %}

## MCP

The Model Context Protocol (MCP) is an open standard to connect AI apps to data sources and tools. The DeepWiki MCP server provides access to the Light Protocol repository with its search capabilities (AskDevin).

### Installation

{% tabs %}
{% tab title="Claude Code" %}

```bash
claude mcp add -s user -t http deepwiki https://mcp.deepwiki.com/mcp
```
{% hint style="success" %}
We recommend to create a command for Claude Code that includes the tools listed below. Simply copy pasted the snippet below.
{% endhint %}

{% code overflow="wrap" expandable="true" %}
```markdown
---
argument-hint: <question>
description: Query Light Protocol repository via DeepWiki MCP with precise technical answers
allowed-tools: mcp__deepwiki__*
---

# /ask-deepwiki Command

Query the Light Protocol repository and Solana resources via DeepWiki MCP for precise technical answers and help with debugging.

## Command Process

When invoked, perform these steps:

### Step 1: Identify Question Scope and Type

- **ZK Compression**
- **Solana fundamentals**
- **Anchor framework**

Note any specific key words like debugging, error, or components mentioned (e.g., LightAccount, ValidityProof, CPI contexts).

### Step 2: Fetch Repository Context

**For ZK Compression / Light Protocol questions:**

`mcp__deepwiki__read_wiki_structure("Lightprotocol/light-protocol")`
`mcp__deepwiki__read_wiki_contents("Lightprotocol/light-protocol")`
`mcp__deepwiki__ask_question("Lightprotocol/light-protocol", "your question")`

**For general Solana questions:**

`mcp__deepwiki__read_wiki_structure("solana-labs/solana")`
`mcp__deepwiki__read_wiki_contents("solana-labs/solana")`
`mcp__deepwiki__ask_question("solana-labs/solana", "your question")`

**For Anchor framework questions:**
`mcp__deepwiki__read_wiki_structure("solana-foundation/anchor")`
`mcp__deepwiki__read_wiki_contents("solana-foundation/anchor")`
`mcp__deepwiki__ask_question("solana-foundation/anchor", "your question")`

**For complex questions:** Query multiple repositories if needed to provide complete context.

### Step 3: Apply Precision Rules

Use technical precision in responses:

**AVOID:**
- Vague verbs: "handles", "manages", "processes", "enables", "provides"
- Abstract terms: "operations", "management", "coordination"
- Marketing language: "powerful", "seamless", "easy"
- Generic descriptions: "account metadata" instead of "CompressedAccountMeta"

**USE:**
- Exact function/method names: `LightAccount::new_init()`, `derive_address()`
- Concrete data structures: `CompressedAccountMeta`, `ValidityProof`, `PackedAddressTreeInfo`
- Specific operations: "nullifies hash", "appends to state tree", "verifies proof"
- Precise field names: `tree_info`, `address`, `output_state_tree_index`
- File:line references when available from DeepWiki responses

### Step 4: Verify with Public Documentation

Cross-reference findings with public documentation:
- **ZK Compression docs**: https://www.zkcompression.com/
- **Markdown export**: Append `.md` to any docs page URL
- **LLM index**: https://www.zkcompression.com/llms.txt
- **Complete docs**: https://www.zkcompression.com/llms-full.txt
- **GitHub source**: https://github.com/Lightprotocol/light-protocol

### Step 5: Format Response

Structure the response with:
1. **Direct answer** - Immediate technical explanation
2. **Technical details** - Specific implementations, data structures
3. **Code examples** - With inline comments explaining key points
4. **Source references** - File:line from DeepWiki or documentation URLs
5. **Related concepts** - Connections to other components (if relevant)

## Notes

- DeepWiki responses include source file references - always include these
- For implementation questions, provide runnable code examples
- Cross-reference multiple sources when accuracy is critical
- Ask follow-up questions to DeepWiki for clarification when needed
```
{% endcode %}

{% endtab %}

{% tab title="Most Clients (Windsurf, Cursor, ...)" %}
```json
{
  "mcpServers": {
    "deepwiki": {
      "serverUrl": "https://mcp.deepwiki.com/sse"
    }
  }
}
```
{% endtab %}
{% endtabs %}

### Tools

The MCP server offers three main tools:

* **read\_wiki\_structure** - Get a list of documentation topics for a GitHub repository

```
mcp__deepwiki__read_wiki_structure("Lightprotocol/light-protocol")
```

* **read\_wiki\_contents** - View documentation about a GitHub repository

```
mcp__deepwiki__read_wiki_contents("Lightprotocol/light-protocol")
```

* **ask\_question** - Ask any question about the GitHub repository and get a context-grounded response

```
mcp__deepwiki__ask_question("Lightprotocol/light-protocol", "your question")
```

{% hint style="success" %}
You can specify any public GitHub repo that is indexed with DeepWiki. When you connect to the MCP, you specify the repository when calling the tools. Learn more [here](https://docs.devin.ai/work-with-devin/deepwiki-mcp).
{% endhint %}

# Next Steps

Start testing your AI tools with compressed tokens or PDAs.

<table data-card-size="large" data-view="cards"><thead><tr><th></th><th data-hidden data-card-target data-type="content-ref"></th></tr></thead><tbody><tr><td><h4>Compressed Tokens</h4></td><td><a href="../compressed-tokens/overview.md">overview.md</a></td></tr><tr><td><h4>Compressed PDAs</h4></td><td><a href="../compressed-pdas/create-a-program-with-compressed-pdas.md">create-a-program-with-compressed-pdas.md</a></td></tr></tbody></table>
