# GitBook Syntax and Markdown Structure Checklist

This checklist validates GitBook-specific syntax and standard Markdown formatting in ZK Compression developer documentation.

## Purpose

CodeRabbit uses this checklist to verify that documentation follows GitBook conventions and proper Markdown structure, ensuring consistent rendering and navigation.

## GitBook Block Syntax

### Hint Blocks

- [ ] All `{% hint %}` blocks have a valid type attribute
  - Valid types: `"info"`, `"success"`, `"warning"`, `"danger"`
  - Example: `{% hint style="info" %}` or `{% hint style="success" %}`
- [ ] Every `{% hint %}` block has a matching `{% endhint %}` closing tag
- [ ] Hint blocks contain meaningful content between opening and closing tags
- [ ] No nested hint blocks (hints inside hints)

### Code Blocks

- [ ] All `{% code %}` blocks have matching `{% endcode %}` closing tags
- [ ] Code block attributes use valid GitBook syntax
  - `title="filename.ts"` for file names
  - `overflow="wrap"` for long lines
  - `expandable="true"` for collapsible code
- [ ] Language identifiers in code fences are valid (typescript, rust, bash, json, toml)
- [ ] Code blocks inside GitBook code tags use triple backticks with language identifiers
  - Example: ` ```typescript` inside `{% code %}...{% endcode %}`

### Tabs

- [ ] All `{% tabs %}` blocks have matching `{% endtabs %}` closing tags
- [ ] Every `{% tab %}` has a title attribute: `{% tab title="Tab Name" %}`
- [ ] Each `{% tab %}` block has a matching `{% endtab %}` closing tag
- [ ] Tabs contain at least 2 tab items
- [ ] Tab titles are unique within the same tabs block

### Stepper

- [ ] All `{% stepper %}` blocks have matching `{% endstepper %}` closing tags
- [ ] Every `{% step %}` block has matching `{% endstep %}` closing tag
- [ ] Steps contain meaningful headers (## Step Title)
- [ ] Steps are used for sequential instructions or processes
- [ ] No empty steps

### Content References

- [ ] All `{% content-ref %}` blocks have matching `{% endcontent-ref %}` closing tags
- [ ] Content ref URL attributes point to valid relative paths
  - Example: `url="how-to-mint-compressed-tokens.md"`
- [ ] Referenced files exist in the documentation structure
- [ ] Link text between tags matches or summarizes the referenced file

### Columns

- [ ] All `{% columns %}` blocks have matching `{% endcolumns %}` closing tags
- [ ] Every `{% column %}` block has matching `{% endcolumn %}` closing tag
- [ ] Column blocks contain balanced content (avoid one empty column)

## Markdown Structure

### Headers

- [ ] Only one H1 header (`#`) per document (usually the title in frontmatter)
- [ ] Header hierarchy is logical (H2 follows H1, H3 follows H2, no skipping levels)
- [ ] Headers use sentence case or title case consistently
- [ ] Headers are descriptive and actionable for guides (e.g., "Install Dependencies", not "Installation")

### Links

- [ ] All Markdown links use correct syntax: `[text](url)`
- [ ] Internal links use relative paths: `../folder/file.md` or `./file.md`
- [ ] External links use full URLs with protocol: `https://example.com`
- [ ] No broken anchor links (`#section-name` exists in target document)
- [ ] Link text is descriptive (avoid "click here" or "this")

### Lists

- [ ] Unordered lists use consistent markers (`-` preferred over `*`)
- [ ] Ordered lists use sequential numbering (`1.`, `2.`, `3.`)
- [ ] List items have consistent indentation (2 or 4 spaces for nested items)
- [ ] No empty list items
- [ ] Lists are not interrupted by non-list content without proper spacing

### Code Fences

- [ ] All code fences have matching opening and closing triple backticks
- [ ] Language identifiers are specified for syntax highlighting
  - Valid: ` ```typescript`, ` ```rust`, ` ```bash`
  - Invalid: ` ``` ` (no language)
- [ ] Code fences are not nested inside inline code (`\`code\``)

### Tables

- [ ] Tables have proper header row with pipe separators
- [ ] Table separator row uses correct syntax: `| --- | --- |`
- [ ] All table rows have matching column counts
- [ ] Tables are not excessively wide (consider breaking into multiple tables)

### Details/Summary (HTML)

- [ ] All `<details>` tags have matching `</details>` closing tags
- [ ] Details blocks contain a `<summary>` element
- [ ] Summary text is descriptive (e.g., "Prerequisites & Setup", not "Click here")

## Frontmatter

- [ ] Every `.md` file has YAML frontmatter delimited by `---`
- [ ] Frontmatter includes required fields:
  - `title:` (string)
  - `description:` (string, can be multiline with `>-`)
- [ ] Optional fields use correct format:
  - `icon:` (string, GitBook icon name)
- [ ] No unescaped special characters in frontmatter values

## Common Syntax Errors

- [ ] No unclosed GitBook blocks (missing `{% end... %}` tags)
- [ ] No invalid GitBook block attributes (typos like `stlye` instead of `style`)
- [ ] No mixing of HTML and Markdown in ways that break rendering
  - Valid: `<details>` with Markdown inside
  - Invalid: Unclosed `<div>` tags mixed with Markdown
- [ ] No hard-wrapped text inside code blocks (breaks rendering)
- [ ] No unescaped special characters in Markdown (use `\` to escape `*`, `_`, `#`, etc.)

## Accessibility and SEO

- [ ] Images have alt text: `![descriptive alt text](path/to/image.png)`
- [ ] External links to tools/services are stable (not temporary redirects)
- [ ] Page title (frontmatter) matches H1 or provides clear context

## Report Format

When reporting GitBook syntax or Markdown issues, use this format:

**Issue:** [Brief description of the problem]
**Location:** [File path, line number, or section]
**Current:** [Show the problematic syntax]
**Expected:** [Show the correct syntax]
**Impact:** [Explain how this affects rendering or navigation]

Example:

**Issue:** Unclosed hint block
**Location:** `compressed-tokens/guides/how-to-mint.md`, line 108
**Current:** `{% hint style="info" %}` with no `{% endhint %}`
**Expected:**
```markdown
{% hint style="info" %}
Get your API key here.
{% endhint %}
```
**Impact:** GitBook will fail to render this page or show broken formatting.
