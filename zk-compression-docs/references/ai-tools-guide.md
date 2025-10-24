---
description: >-
  Guidance to AI tools when working with ZK Compression. Includes MCP server, DeepWiki, and AI Search guides.
---

# How to Use AI Tools with ZK Compression

{% endhint %}

{% endhint %}

ZK Compression supports multiple AI integration methods to accelerate your development:

**Docs:**
- **[Docs AI Search](#ai-search)** - Search documentation with AI in the search bar.
- **llms.txt** - Site index for LLM navigation: [https://zkcompression.com/llms.txt](https://zkcompression.com/llms.txt).
- **Markdown Export** - Append `.md` to any page URL for raw markdown.

**Development:**
- **[DeepWiki](#deepwiki)** - Query the Light Protocol repository in natural language.
  * Helpful for deep technical questions and debugging.
  * [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol).

- **[MCP](#mcp)** 
  - Connect AI tools to the Light Protocol repository via Model Context Protocol.
  - Find a guide to the MCP tools below.
{% tabs %}
{% tab title="Installation for Claude Code" %}

{% endhint %}
We recommend to create a command for Claude Code that includes the tools listed below.
{% endhint %}

```bash
claude mcp add -s user -t http deepwiki https://mcp.deepwiki.com/mcp
```
{% endtab %}

{% tab title="Installation for most clients (Windsurf, Cursor, ...)" %}
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


## DeepWiki

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol)

Use DeepWiki and its search capabilities (AskDevin) to query the Light Protocol repository in natural language.

- DeepWiki generates systematic documentation.
{% embed url="https://drive.google.com/file/d/1icUV-c6uNb52IOlHRwsGtX2tRMa39mbJ/view?usp=share_link" %}

- AskDevin helps with debugging and technical questions.
{% embed url="https://drive.google.com/file/d/1irbZC4NpSE6F1XctIel0yXyVmwvRsjaU/view?usp=share_link" %}

{% hint style="info" %}
You can index and query any public GitHub repository with DeepWiki to produce wikis with architecture diagrams, source links, and codebase summaries.
{% endhint %}

## MCP

The Model Context Protocol (MCP) is an open standard to connect AI apps to data sources and tools. The DeepWiki MCP server provides access to the Light Protocol repository with its search capabilities (AskDevin).

### Installation

{% tabs %}
{% tab title="Claude Code" %}

{% endhint %}
We recommend to create a command for Claude Code that includes the tools listed below.
{% endhint %}

```bash
claude mcp add -s user -t http deepwiki https://mcp.deepwiki.com/mcp
```
{% endtab %}

{% tab title="Most clients (Windsurf, Cursor, ...)" %}
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

* **read_wiki_structure** - Get a list of documentation topics for a GitHub repository

```
mcp__deepwiki__read_wiki_structure("Lightprotocol/light-protocol")
```

* **read_wiki_contents** - View documentation about a GitHub repository

```
mcp__deepwiki__read_wiki_contents("Lightprotocol/light-protocol")
```

* **ask_question** - Ask any question about the GitHub repository and get a context-grounded response

```
mcp__deepwiki__ask_question("Lightprotocol/light-protocol", "your question")
```

{% hint style="success" %}
You can specify any public GitHub repo that is indexed with DeepWiki. When you connect to the MCP, you specify the repository when calling the tools.
Learn more [here](https://docs.devin.ai/work-with-devin/deepwiki-mcp).
{% endhint %}

## Next Steps

Start building with compressed tokens or PDAs.

{% columns %}
{% column %}
{% content-ref url="../compressed-tokens" %}
[overview.md](../compressed-tokens/overview.md)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="../compressed-pdas" %}
[create-a-program-with-compressed-pdas.md](../compressed-pdas/create-a-program-with-compressed-pdas.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}