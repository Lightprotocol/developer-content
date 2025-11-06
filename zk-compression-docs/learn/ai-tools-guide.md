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
We recommend to create a command that includes the tools listed below. Simply copy paste this snippet.
{% endhint %}

{% code overflow="wrap" expandable="true" %}
```markdown
---
argument-hint: <question>
description: Query Light Protocol repository and Solana resources via DeepWiki MCP for precise technical answers and help with debugging
allowed-tools: mcp__deepwiki__*
---

# /ask-deepwiki

Answer: $ARGUMENTS

Use DeepWiki MCP to provide precise technical answers.

## Step 1: Identify Repository Scope

1. **State understanding and plan**

2. **If question is vague, ask for clarification:**
- What specific component or feature?
- What problem are you solving?
- What level of detail needed (overview vs implementation)?

3. **Repository mapping:**
- ZK Compression/Light Protocol: `Lightprotocol/light-protocol`
- Solana fundamentals: `solana-labs/solana`
- Anchor framework: `solana-foundation/anchor`
- Complex questions: Query multiple repositories

4. **Refine question to use:**
- Exact component names: `CompressedAccountMeta` not "account metadata"
- Specific operations: "verifies proof" not "handles proof"
- Concrete function names or error messages when available

## Step 2: Query DeepWiki

For the identified repository, call in sequence:

1. `mcp__deepwiki__read_wiki_structure("repo-owner/repo-name")`
2. `mcp__deepwiki__read_wiki_contents("repo-owner/repo-name")`
3. `mcp__deepwiki__ask_question("repo-owner/repo-name", refined_question)`

Query multiple repositories if question spans different systems.

## Step 3: Format Response

**Structure:**
1. Direct answer with technical explanation
2. Specific implementations and data structures
3. Code examples with inline comments
4. Source references (`file:line` from DeepWiki)
5. Related concepts if relevant

**Language precision:**

NEVER use vague verbs:
- "handles", "manages", "processes", "enables", "provides"

ALWAYS use exact names:
- Functions: `LightAccount::new_init()`, `derive_address()`
- Types: `CompressedAccountMeta`, `ValidityProof`, `PackedAddressTreeInfo`
- Operations: "nullifies hash", "appends to state tree", "verifies proof"
- Fields: `tree_info`, `address`, `output_state_tree_index`

Include `file:line` references from DeepWiki responses.

## Notes

- Always include source file references from DeepWiki responses
- Provide runnable code examples for implementation questions
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
