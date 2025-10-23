---
description: >-
  Guidance how to use AI tools when working with ZK Compression. Includes MCP server, AskDevin, and AI Search guides.
hidden: true
---
# How to use AI Tools with ZK Compression

ZK Compression supports multiple ways to use AI to build with ZK Compression.

* MCP
* Indexed Repo with AskDevin
* AI Chat
* llms.txt
* .md


## AI Search

## DeepWiki

## MCP
​
The Model Context Protocol (MCP) is an open standard that enables AI apps to securely connect to MCP-compatible data sources and tools.
The DeepWiki MCP server provides access to public repository documentation and search capabilities (Ask Devin).

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
* read_wiki_structure - Get a list of documentation topics for a GitHub repository
  `mcp__deepwiki__read_wiki_structure("Lightprotocol/light-protocol")`
* read_wiki_contents - View documentation about a GitHub repository
  `mcp__deepwiki__read_wiki_contents("Lightprotocol/light-protocol")`
* ask_question - Ask any question about the GitHub repository and get a context-grounded response
  `mcp__deepwiki__ask_question("Lightprotocol/light-protocol", "your question")`

{% hint style="success" %}
You can specify any public GitHub repo that is indexed with DeepWiki. When you connect to the MCP, you specify the repository when calling the tools.
Learn more [here](https://docs.devin.ai/work-with-devin/deepwiki-mcp).
{% endhint %}