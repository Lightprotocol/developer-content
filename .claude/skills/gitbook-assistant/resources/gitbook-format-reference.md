---
description: Complete reference for all GitBook block types and inline content with markdown syntax examples
---

# GitBook Blocks Reference

## Paragraph

A paragraph is the most basic content block. Simply write plain text separated by blank lines.

```markdown
Professionally printed material in English typically does not indent the first paragraph, but indents those that follow.

This is a second paragraph. You can use inline formatting like **bold**, *italic*, and `code`.
```

## Headings

Page titles are automatically H1. Use H2–H4 for content headings:

```markdown
## Section Heading (H2)
### Subsection Heading (H3)
#### Sub-subsection Heading (H4)
```

H2 and H3 headings appear in the page outline. Each heading automatically generates an anchor link.

**Custom anchors:** Open the Options menu and select "Edit anchor" to set a custom anchor that persists even if heading text changes.

## Lists

### Unordered List

```markdown
- Item
   - Nested item
      - Another nested item
   - Yet another nested item
- Another item
- Yet another item
```

Use **Tab** to indent and **Shift + Tab** to outdent.

### Ordered List

```markdown
1. Item 1
   1. Nested item 1.1
      1. Nested item 1.1.1
   2. Nested item 1.2
2. Item 2
3. Item 3
```

GitBook automatically renumbers items when editing. You can insert images within lists and continue numbering afterward.

### Task List

```markdown
- [ ] Here's a task that hasn't been done
  - [x] Here's a subtask that has been done
  - [ ] Here's a subtask that hasn't been done
- [ ] Another uncompleted task
```

Readers of published spaces cannot check or uncheck boxes. Only editors control checkbox state.

## Quote

```markdown
> "No human ever steps in the same river twice, for it's not the same river and they are not the same human." — _Heraclitus_
```

**Quick creation:** Type `>` followed by space in an empty paragraph.

## Hint

Four hint styles highlight important information with visual distinction.

### Info

```markdown
{% hint style="info" %}
**Info hints** are great for showing general information, or providing tips and tricks.
{% endhint %}
```

### Success

```markdown
{% hint style="success" %}
**Success hints** are good for showing positive actions or achievements.
{% endhint %}
```

### Warning

```markdown
{% hint style="warning" %}
**Warning hints** are good for showing important information or non-critical warnings.
{% endhint %}
```

### Danger

```markdown
{% hint style="danger" %}
**Danger hints** are good for highlighting destructive actions or raising attention to critical information.
{% endhint %}
```

### Hint with Nested Content

```markdown
{% hint style="info" %}

## This is a H2 heading

This is a line with text content.

- This is an unordered list item
- Another list item with **bold text**

{% endhint %}
```

Hints support headings, lists, inline formatting, and images accessible through the `/` insert palette.

## Code Block

```markdown
{% code title="index.js" overflow="wrap" lineNumbers="true" %}
```javascript
import * as React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, window.document.getElementById('root'));
```
{% endcode %}
```

**Attributes:**
- `title` - Display filename or label at top
- `lineNumbers` - Show line numbers (`"true"` or `"false"`)
- `overflow` - Handle long lines (`"wrap"` for text wrapping)

**Full-width:** Access the options menu and select **Full width** to span the entire viewport.

**Syntax highlighting:** GitBook uses Prism for syntax highlighting. Common language identifiers:
- ` ```javascript` or ` ```js`
- ` ```typescript` or ` ```tsx`
- ` ```python`
- ` ```bash` or ` ```shell`
- ` ```solidity`
- ` ```rust`
- ` ```go`

## Images

### Simple Block Image

```markdown
![](https://gitbook.com/images/gitbook.png)
```

### Block Image with Caption

```markdown
![The GitBook Logo](https://gitbook.com/images/gitbook.png)
```

### Block Image with Alt Text

```markdown
<figure><img src="https://gitbook.com/images/gitbook.png" alt="The GitBook Logo"></figure>
```

### Block Image with Caption and Alt Text

```markdown
<figure><img src="https://gitbook.com/images/gitbook.png" alt="The GitBook Logo"><figcaption><p>GitBook Logo</p></figcaption></figure>
```

### Framed Image

```markdown
<div data-with-frame="true"><img src="https://gitbook.com/images/gitbook.png" alt="The GitBook Logo"></div>
```

### Dark and Light Mode Variants

```markdown
<figure>
  <picture>
    <source srcset="https://example.com/dark-logo.png" media="(prefers-color-scheme: dark)">
    <img src="https://example.com/light-logo.png" alt="GitHub logo">
  </picture>
  <figcaption>Logo with theme support</figcaption>
</figure>
```

### Image Sizing

```markdown
<img src="image.png" alt="Description" width="100" />
<img src="image.png" alt="Description" width="100%" />
```

### Accessibility

Use meaningful alt text that describes the image content. For decorative images, use empty alt text (`alt=""`). Add captions to provide additional context where helpful.

## Embedded URL

```markdown
{% embed url="https://www.youtube.com/watch?v=example" %}
```

**Supported platforms:**
- YouTube and Vimeo (videos)
- Codepen
- Spotify

**Video parameters:** Common YouTube URL parameters:
- `?autoplay=1` - Auto-play video on load
- `&loop=1` - Loop the video
- `&start=30` - Start at 30 seconds
- `&end=120` - End at 2 minutes
- `&mute=1` - Start muted
- Example: `{% embed url="https://youtube.com/watch?v=abc?start=30&mute=1" %}`

**Requirements:** Content must be publicly available. For Google Docs, set sharing to "Anyone with the link."

## Table

### Basic Table

```markdown
|   |   |   |
| - | - | - |
|   |   |   |
|   |   |   |
|   |   |   |
```

### Column Types

Tables support various data types:
- **Text** - Standard formatting support
- **Number** - Numeric values with optional decimals
- **Checkbox** - Binary toggle for each row
- **Select** - Single or multiple choice from defined options
- **Users** - Organization members (single or multiple)
- **Files** - File references with upload capability
- **Rating** - Star ratings with configurable maximum

### Table Features

**Options:**
- Toggle header row visibility
- Switch between table and card views
- Hide/show specific columns
- Reset column sizing
- Enable full-width display
- Sort and filter table data
- Import data from CSV files

**Management:**
- Resize columns by dragging edges (stored as percentages)
- Insert images within cells using `/` command
- Horizontal scrolling for wide tables
- Add/remove rows and columns via context menu

## Cards

```markdown
<table data-view="cards">
  <thead>
    <tr>
      <th></th>
      <th></th>
      <th data-hidden data-card-target data-type="content-ref"></th>
      <th data-hidden data-card-cover data-type="files"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Card Title</strong></td>
      <td>Card description text goes here.</td>
      <td><a href="https://example.com">https://example.com</a></td>
      <td><a href=".gitbook/assets/image.svg">image.svg</a></td>
    </tr>
    <tr>
      <td><strong>Another Card</strong></td>
      <td>Another card description.</td>
      <td><a href="https://example2.com">https://example2.com</a></td>
      <td><a href=".gitbook/assets/image2.svg">image2.svg</a></td>
    </tr>
  </tbody>
</table>
```

**Structure:**
- `data-view="cards"` - Identifies table as card block
- `data-card-target` - Contains link URL (hidden column)
- `data-card-cover` - Holds cover image reference (hidden column)
- First column: Card title (typically bold)
- Second column: Card description

**Options:** Cards support medium/large sizing and full-width display.

## Tabs

```markdown
{% tabs %}

{% tab title="Windows" %}
Here are the instructions for Windows.

You can include code blocks, images, and other content.
{% endtab %}

{% tab title="macOS" %}
Here are the instructions for macOS.
{% endtab %}

{% tab title="Linux" %}
Here are the instructions for Linux.
{% endtab %}

{% endtabs %}
```

Each tab can contain multiple blocks including code blocks, images, integration blocks, and more.

**Limitations:** Tabs cannot be nested inside other blocks. Tabs cannot contain other tabs, expandables, or API blocks.

## Expandable

```markdown
<details>

<summary>Expandable block title</summary>

Your content here. Can include headings, lists, code blocks, tables, quotes, and hint blocks.

## Example heading

- List item one
- List item two

</details>
```

**Purpose:** Hide content behind a toggle to reduce page length, create FAQs, or enable progressive disclosure.

**Limitations:** Expandables cannot be nested inside other blocks. Some block types cannot be placed inside expandables.

## Stepper

```markdown
{% stepper %}
{% step %}
## Step 1 title
Step 1 text and detailed instructions.
{% endstep %}

{% step %}
## Step 2 title
Step 2 text and detailed instructions.
{% endstep %}

{% step %}
## Step 3 title
Step 3 text and detailed instructions.
{% endstep %}
{% endstepper %}
```

**Purpose:** Break down tutorials or guides into sequential, visually-linked steps.

**Content support:** Each step can contain paragraphs, code blocks, drawings, images, embedded URLs, tables, cards, tabs, expandable and more.

## Columns

```markdown
{% columns %}
{% column width="50%" %}
### Create a seamless experience

Integrate your documentation right into your product experience, or give users a personalized experience that gives them what they need faster.

<a href="https://www.gitbook.com" class="button primary">Learn more</a>
{% endcolumn %}

{% column %}
<figure><img src=".gitbook/assets/example.png" alt="Example image"><figcaption></figcaption></figure>
{% endcolumn %}
{% endcolumns %}
```

**Width control:** Set explicit width percentages or let columns auto-adjust to fill remaining space.

**Content flexibility:** Place paragraphs, headings, images, buttons, figures, and more inside columns.

## Drawing

```markdown
<img src=".gitbook/assets/diagram.drawing.svg" alt="Architecture diagram" class="gitbook-drawing">
```

**Features:**
- GitBook uses Excalidraw for creating drawings
- Drawings saved as `.drawing.svg` files
- AI-powered drawing generation (Pro/Enterprise plans)
- Double-click to edit with full drawing palette

## Math & TeX

```markdown
$$f(x) = x \cdot e^{2\pi i \xi x}$$
```

GitBook uses the KaTeX library for rendering mathematical expressions. Supports both block-level and inline usage.

**Common LaTeX syntax:**
- `\cdot` for multiplication dot
- `\pi` for π
- `\sum_{i=1}^{n}` for summation
- `\frac{a}{b}` for fractions
- `\int_{a}^{b}` for integrals

## OpenAPI Blocks

GitBook enables automatic REST API documentation through OpenAPI integration.

### Basic Syntax

```markdown
{% openapi src="https://api.example.com/openapi.json" path="/api/v3/users" method="get" %}
https://api.example.com/openapi.json
{% endopenapi %}
```

### Parameters

- `src` - Location of the OpenAPI specification (URL or file path)
- `path` - Specific API endpoint to display (e.g., `/api/v3/users`)
- `method` - HTTP verb (`get`, `post`, `put`, `delete`, `patch`)

### Supported Formats

- Swagger 2.0
- OpenAPI 3.0 (including 3.0.3)
- Both JSON and YAML formats

### Examples

**Using URL source:**
```markdown
{% openapi src="https://api.github.com/openapi.yaml" path="/repos/{owner}/{repo}" method="get" %}
https://api.github.com/openapi.yaml
{% endopenapi %}
```

**Using local file:**
```markdown
{% openapi src=".gitbook/assets/api-spec.json" path="/users/{id}" method="post" %}
.gitbook/assets/api-spec.json
{% endopenapi %}
```

### Features

- **Interactive testing** - Powered by Scalar technology, users can execute API calls directly within documentation
- **Automatic visualization** - Displays API methods, parameters, schemas, and authentication requirements
- **Full-width support** - OpenAPI blocks can span the entire viewport width

### CORS Requirements

API servers must include the `Access-Control-Allow-Origin` header and specifically permit `*.gitbook.io` for proper loading.

```
Access-Control-Allow-Origin: *.gitbook.io
```

Without proper CORS configuration, the interactive API testing features may not function correctly.

## OpenAPI Extensions

GitBook supports custom OpenAPI extensions (prefixed with `x-`) to enhance API documentation.

### Navigation and Display Extensions

**`x-page-title` / `x-displayName`**

Changes how tags appear in navigation and page titles.

```yaml
tags:
  - name: user
    x-page-title: User Management
    x-displayName: Users
```

**`x-page-description`**

Adds descriptive text to tag pages.

```yaml
tags:
  - name: authentication
    x-page-description: Endpoints for managing user authentication and sessions
```

**`x-page-icon`**

Incorporates Font Awesome icons for visual organization.

```yaml
tags:
  - name: security
    x-page-icon: lock
```

**`x-parent`**

Creates hierarchical relationships between tags for nested page structures.

```yaml
tags:
  - name: users
  - name: user-settings
    x-parent: users
```

### Endpoint Control Extensions

**`x-hideTryItPanel`**

Toggles the "Test it" interactive button for specific API operations.

```yaml
paths:
  /admin/delete-all:
    delete:
      x-hideTryItPanel: true
      summary: Delete all users
```

**`x-internal` / `x-gitbook-ignore`**

Completely removes endpoints from published documentation.

```yaml
paths:
  /internal/debug:
    get:
      x-internal: true
      summary: Internal debugging endpoint
```

**`x-stability`**

Marks endpoints with stability status: `experimental`, `alpha`, or `beta`.

```yaml
paths:
  /v2/experimental:
    get:
      x-stability: experimental
      summary: Experimental feature
```

**`deprecated`**

Indicates outdated endpoints with visual warnings.

```yaml
paths:
  /v1/old-endpoint:
    get:
      deprecated: true
      summary: Legacy endpoint
```

**`x-deprecated-sunset`**

Specifies removal dates for deprecated endpoints using ISO 8601 format (YYYY-MM-DD).

```yaml
paths:
  /v1/users:
    get:
      deprecated: true
      x-deprecated-sunset: "2025-12-31"
      summary: Will be removed on December 31, 2025
```

### Code Sample Extensions

**`x-codeSamples`**

Displays language-specific code examples for API endpoints.

```yaml
paths:
  /user:
    get:
      summary: Get the current user
      x-codeSamples:
        - lang: 'cURL'
          label: 'CLI'
          source: |
            curl -L \
              -H 'Authorization: Bearer <token>' \
              'https://api.example.com/v1/user'
        - lang: 'JavaScript'
          label: 'Node.js'
          source: |
            const response = await fetch('https://api.example.com/v1/user', {
              headers: { 'Authorization': 'Bearer <token>' }
            });
        - lang: 'Python'
          source: |
            import requests
            response = requests.get(
              'https://api.example.com/v1/user',
              headers={'Authorization': 'Bearer <token>'}
            )
```

**Structure:**
- `lang` (string) - Code sample language
- `label` (string, optional) - Code sample label
- `source` (string) - Code sample source code

### Schema Extensions

**`x-enumDescriptions`**

Provides individual descriptions for enum values in schemas.

```yaml
components:
  schemas:
    Status:
      type: string
      enum:
        - pending
        - active
        - suspended
      x-enumDescriptions:
        pending: Account is awaiting verification
        active: Account is fully operational
        suspended: Account has been temporarily disabled
```

## Page Link

```markdown
{% content-ref url="./" %}
.
{% endcontent-ref %}
```

Page links create prominent internal navigation between documentation pages. Use relative paths to reference other pages.

**Purpose:** Show relations between pages with visual prominence compared to inline hyperlinks.

### Custom Anchors

Create custom anchors for headings that persist even when heading text changes.

**Syntax:**
```markdown
## My Heading {#custom-anchor}
### Another Section {#another-anchor}
```

**Important:** No space between `{` and `#` — use `{#anchor}` not `{ #anchor}`.

**Referencing anchors:**
```markdown
[Link to section](#custom-anchor)
[Link to another section](#another-anchor)
```

### Internal Navigation Best Practices

**Relative vs Absolute Links:**
- **Relative links** (recommended): `[Link text](../path/page.md)` — auto-update when content moves
- **Absolute links**: `[Link text](/path/page.md)` — fixed paths

**Automatic anchor links:**
- All headings automatically generate anchor links
- Hover over headings to reveal the `#` symbol
- Click to update browser URL for easy sharing

**Editing anchors:**
- Open Options menu on heading
- Select "Edit anchor"
- Set custom anchor to preserve links when changing heading text

## Reusable Content

Sync content across multiple pages and spaces. Edit all instances simultaneously from a single source.

### Creating Reusable Content

1. Select the content block you want to make reusable
2. Open the Actions menu (three dots)
3. Select **Turn into** → **Reusable content**
4. Give the reusable content a name

### Inserting Reusable Content

**Method 1 - Insert palette:**
1. Press `/` on an empty line
2. Search for "reusable" or the name of your reusable content
3. Select the content to insert

**Method 2 - Direct search:**
1. Type `/` and start typing the reusable content name
2. Select from the filtered results

### Features

- **Simultaneous editing** - Changes to reusable content update all instances across pages and spaces
- **GitHub/GitLab sync** - Fully supported with version control integration
- **Export behavior** - Reusable content exported to dedicated `includes` folder
- **Cross-space sharing** - Use the same content blocks across multiple documentation spaces

### Migration Note

The legacy "Snippets" feature is deprecated. Use Reusable Content for all new synchronized content blocks.

## Inline Content

### Bold, Italic, Code

```markdown
This is **bold text**, *italic text*, and `inline code`.
```

### Links

```markdown
[Link text](https://example.com)
[Relative link](../path/page.md)
[Email link](mailto:address@email.com)
```

### Annotations (Footnotes)

```markdown
This text has an annotation[^1] that adds context.

[^1]: This is the annotation text that appears when hovering or clicking.
```

### Inline Images

```markdown
<img src="image.png" alt="Logo" data-size="line">
```

**Sizing options:**
- `data-size="line"` - Inline size (proportional to text)
- Original size (max 300px)
- Convert to block image

**Use Cases:**
- **Icons** - Small inline graphics that match text height
- **Badges** - Status or version indicators
- **Logos** - Brand marks within paragraphs
- **Emoji alternatives** - Custom graphics as emoji replacements

**Font Awesome Integration:**
- GitBook includes Font Awesome icons
- Insert via emoji/icon picker
- Use `:icon-name:` syntax for common icons
- Custom icon uploads supported

### Inline Images with Dark Mode

```markdown
<picture>
  <source srcset="dark-logo.png" media="(prefers-color-scheme: dark)"/>
  <img src="light-logo.png" alt="Logo"/>
</picture>
```

Automatically adapts based on user's color scheme preference.

### Emojis

```markdown
:house: :car: :dog:
```

Type `:` followed by emoji name, or use the emoji picker.

### Buttons

```markdown
<a href="https://example.com" class="button primary">Primary Button</a>
<a href="https://example.com" class="button secondary">Secondary Button</a>
```

**Creating Buttons:**
- Insert via `/` menu and select "Button"
- Choose primary or secondary style
- Configure link destination

**Link Types:**
- **External links** - Full URLs to external sites (`https://example.com`)
- **Internal links** - Relative paths to other documentation pages (`../guide/getting-started.md`)
- **Anchor links** - Links to sections on same page (`#configuration`)

**Use Cases:**
- **Call to action** - Drive users to sign up, download, or take action
- **Navigation** - Highlight important documentation sections
- **External resources** - Link to dashboards, tools, or related sites
- **Downloads** - Direct links to files, SDKs, or resources

### Icons

```markdown
:github: :twitter: :linkedin:
```

GitBook uses Font Awesome icons.

### Variables

Define reusable values that can be referenced throughout your documentation. Variables are useful for version numbers, product names, URLs, and other repeated content.

**Variable Scopes:**
- **Page variables** - Available on specific page (`page.vars`)
- **Space variables** - Available across entire space (`space.vars`)

**Creating Variables:**
1. Open space or page settings
2. Navigate to Variables section
3. Define key-value pairs
4. Reference using expression syntax

**Accessing Variables:**
```markdown
Current version: {{ space.vars.version }}
Product name: {{ space.vars.productName }}
Page-specific value: {{ page.vars.customValue }}
```

**Use Cases:**
- Version numbers that change across releases
- Product names used throughout documentation
- API endpoint URLs
- Repeated phrases or terminology
- Configuration values

**Benefits:**
- Update all instances by changing variable definition once
- Maintain consistency across documentation
- Reduce maintenance burden

### Expressions

Dynamically display content and create conditional sections using JavaScript expressions.

**Basic Syntax:**
```markdown
Hello, {{ user.name }}!
Current workspace: {{ workspace.name }}
```

**Conditional Content:**
```markdown
{% if plan == "pro" %}
Thanks for being a Pro customer. You have access to advanced features.
{% endif %}

{% if visitor.claims.unsigned.beta_features %}
You have beta features enabled.
{% endif %}
```

**JavaScript Requirement:**
- All expressions must be written in valid JavaScript
- Access objects and properties using dot notation
- Use standard JavaScript operators and logic

**Autocomplete:**
- Insert expressions via `/` menu
- Double-click expression to open editor
- Autocomplete suggestions help find available variables and claims

**Available Objects:**
- `user` - Current user information
- `workspace` - Current workspace data
- `space.vars` - Space-level variables
- `page.vars` - Page-level variables
- `visitor` - Visitor claims and attributes (see Conditional Content)

**Inline Usage:**
- Insert expressions inline within paragraphs
- Reference variables dynamically
- Personalize content based on user attributes

**Relationship to Conditional Content:**
- Expressions show dynamic values: `{{ variable }}`
- Conditional content shows/hides blocks: `{% if condition %}...{% endif %}`
- Both use similar syntax but serve different purposes

## Conditional Content

Show or hide content based on visitor attributes, user claims, or other contextual data. Create personalized documentation experiences.

### Basic Syntax

```markdown
{% if visitor.claims.unsigned.example_attribute %}
This content is visible only to visitors with the example_attribute.
{% endif %}
```

### Negation

```markdown
{% if !visitor.claims.unsigned.example_attribute %}
This content is visible only to visitors WITHOUT the example_attribute.
{% endif %}
```

### Visitor Claims Structure

Claims are data passed through users and attached to the `visitor.claims` object.

**Signed Claims:**
- Verified and secure
- Passed via JWT (JSON Web Token)
- Use for sensitive or authenticated data

**Unsigned Claims:**
- Not cryptographically verified
- Use for URL parameters, unsigned cookies, feature flags
- Must be declared in schema under "unsigned" property

**Accessing Claims:**
```markdown
{% if visitor.claims.unsigned.beta_features %}
Welcome to our beta program!
{% endif %}

{% if visitor.claims.signed.subscription == "premium" %}
You have access to premium features.
{% endif %}
```

### Integration with Authentication

Include additional user attributes (claims) in JWT payload to enable conditional content based on authentication.

**Example JWT payload:**
```json
{
  "sub": "user123",
  "name": "John Doe",
  "subscription": "premium",
  "beta_features": true,
  "region": "us-east"
}
```

**Using claims in documentation:**
```markdown
{% if visitor.claims.signed.subscription == "premium" %}
## Premium Features

Access our advanced API endpoints and higher rate limits.
{% endif %}

{% if visitor.claims.signed.region == "eu" %}
Your data is stored in our EU data centers in compliance with GDPR.
{% endif %}
```

### Use Cases

**Feature Flags:**
```markdown
{% if visitor.claims.unsigned.new_ui %}
Try our new interface! [Click here](#new-ui)
{% endif %}
```

**Subscription Tiers:**
```markdown
{% if visitor.claims.signed.plan == "enterprise" %}
Contact your dedicated account manager for support.
{% endif %}
```

**Regional Content:**
```markdown
{% if visitor.claims.unsigned.country == "US" %}
Call us toll-free: 1-800-EXAMPLE
{% endif %}
```

**Beta Programs:**
```markdown
{% if visitor.claims.unsigned.beta_tester %}
**Beta Testers:** Try the new API at `/v2/beta/`
{% endif %}
```

### Schema Configuration

Unsigned claims must be declared in your schema:

```json
{
  "unsigned": {
    "beta_features": "boolean",
    "country": "string",
    "feature_flags": "array"
  }
}
```

### Best Practices

- Use signed claims for sensitive or user-specific content
- Use unsigned claims for public feature flags and preferences
- Test conditional content with different claim combinations
- Document which claims are required for viewing specific content
- Consider fallback content for users without specific claims

## Advanced Features

GitBook provides modern capabilities for AI integration, programmatic access, and enhanced discoverability.

### LLM-Ready Documentation

GitBook automatically generates LLM-friendly versions of your documentation.

**Automatic Files:**
- `/llms.txt` - Index file with documentation structure and key topics
- `/llms-full.txt` - Complete documentation content optimized for AI processing

**Purpose:**
- Enable AI assistants to access and understand your documentation
- Provide structured content for language models
- Improve discoverability in AI-powered search tools

**Access:**
- Files generated automatically for published spaces
- No configuration required
- Updated when documentation changes

### MCP Server Integration

GitBook creates Model Context Protocol (MCP) servers for AI tool integration.

**Features:**
- Programmatic access to documentation content
- Integration with Claude, cursor, and other AI tools
- Structured data access for external systems

**Use Cases:**
- AI coding assistants referencing your API docs
- Automated documentation testing
- Content analysis and quality checks
- Integration with internal tools

### AI-Powered Capabilities

**GitBook AI Features:**
- **Content optimization** - AI suggestions for improving clarity and structure
- **Automated translation** - Multi-language documentation support
- **AI-driven search** - Semantic search understanding user intent
- **Smart suggestions** - Content recommendations based on context

**Availability:**
- Features vary by plan (Pro, Enterprise)
- Check GitBook settings for enabled AI capabilities

## Full-Width Support

The following blocks support full-width display via options menu:
- Code blocks
- Images
- Tables
- Cards
- Columns
- OpenAPI blocks
- API blocks
- Integration blocks

**Enabling Full-Width:**
1. Select the block
2. Open the options menu (three dots or right-click)
3. Select **Full width**

**Use Cases:**
- Wide code examples that need horizontal space
- Large tables with many columns
- API reference blocks with extensive parameter lists
- Images that benefit from maximum viewport width

## Keyboard Shortcuts

**Block operations:**
- `/` - Open insert palette
- `+` button - Insert blocks
- `>` + Space - Create quote block
- `Tab` - Indent list items
- `Shift + Tab` - Outdent list items
- `Cmd/Ctrl + Enter` - Exit current block
- `Enter` twice - Exit list or start new block

**Text formatting:**
- `Cmd/Ctrl + B` - Bold text
- `Cmd/Ctrl + I` - Italic text
- `Cmd/Ctrl + K` - Insert/edit link
- Backtick (`` ` ``) - Inline code
- `Cmd/Ctrl + E` - Inline code (alternative)

## Block Nesting Limitations

Understanding block nesting restrictions helps avoid compatibility issues when creating complex documentation layouts.

### Specific Limitations

**Tabs:**
- Cannot contain expandables
- Cannot contain API blocks or OpenAPI blocks

**Steppers:**
- Cannot contain other stepper blocks
- Can contain expandable blocks and most other block types (paragraphs, code, images, tables, cards, tabs)

**OpenAPI Blocks:**
- Cannot be nested inside tabs
- Can be placed in most other contexts

**Reusable Content:**
- Can contain most block types
- Nesting behavior depends on the blocks within the reusable content
- Test thoroughly when using complex nested structures

### Workarounds

If you encounter nesting limitations:
- Use multiple separate blocks instead of nesting
- Consider page links to related content
- Restructure content to avoid problematic nesting
- Use columns for side-by-side layouts instead of nested containers
