---
description: >-
  Guidance to AI tools when working with ZK Compression. Includes MCP server, DeepWiki, and AI Search guides.
---

# How to Use AI Tools with ZK Compression

ZK Compression supports multiple AI integration methods to accelerate your development:

- **[AI Search](#ai-search)** - Search documentation with AI search
- **[DeepWiki](#deepwiki)** - Query the Light Protocol repository in natural language.
- **[MCP](#mcp)** - Connect AI tools to the Light Protocol repository via Model Context Protocol.
- **llms.txt** - Site index for LLM navigation: [https://zkcompression.com/llms.txt](https://zkcompression.com/llms.txt).
- **Markdown Export** - Append `.md` to any page URL for raw markdown.


## AI Search

Use AI search to quickly find information, get code examples, and learn complex topics. Available throughout our documentation.

{% embed url="https://drive.google.com/file/d/1-oxTqNMQX8LqP8FYSCDiG3YzIixnPbiN/view?usp=share_link" %}


## DeepWiki

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Lightprotocol/light-protocol)

Use DeepWiki and its search capabilities (AskDevin) to query the Light Protocol repository in natural language.

- DeepWiki generates systematic documentation
- AskDevin helps with debugging and technical questions

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

* **read_wiki_structure** - Get a li*st of documentation topics for a GitHub repository

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
{% content-ref url="../compressed-tokens/overview.md" %}
[overview.md](../compressed-tokens/overview.md)
{% endcontent-ref %}
{% endcolumn %}

{% column %}
{% content-ref url="../compressed-pdas/create-a-program-with-compressed-pdas.md" %}
[create-a-program-with-compressed-pdas.md](../compressed-pdas/create-a-program-with-compressed-pdas.md)
{% endcontent-ref %}
{% endcolumn %}
{% endcolumns %}