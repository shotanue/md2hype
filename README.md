# md2hype

![lint](https://github.com/shotanue/md2hype/actions/workflows/lint.yml/badge.svg)
![test](https://github.com/shotanue/md2hype/actions/workflows/test.yml/badge.svg)

A text converter that transforms markdown into HTML, powered by [unified.js](https://unifiedjs.com) and [bun.sh](https://bun.sh).

## Built-in unifiedjs plugins

- `remark-breaks`
- `remark-frontmatter`
- `remark-gfm`
- `remark-parse`

## Installation

md2hype is easily installable via Homebrew, built with a JavaScript runtime [bun.sh](https://bun.sh):

```bash
brew install shotanue/tap/md2hype
```

## How to Use

### Basic Conversion

Convert a markdown file (`foo.md`) to HTML, including both HTML content and parsed frontmatter in JSON format:

```bash
md2hype --file foo.md
```

**Example Input (`foo.md`):**
```md
---
tag:
  - foo
---
hello world
```

**Example Output:**
```json
{
  "html": "<p>hello world</p>",
  "frontmatter": {
    "tag": ["foo"]
  }
}
```

### HTML-Only Output

For scenarios where only the HTML output is required, excluding frontmatter:

```bash
md2hype --file foo.md --html
```

**Example Output:**
```html
<p>hello world</p>
```

### Additional Features

- **Standard Input Support**: md2hype can also be used with standard input (stdin).
  
  ```bash
  cat foo.md | md2hype
  ```

- **Help Option**: For more information about the usage and options, use the `--help` or `-h` flag.

  ```bash
  md2hype --help
  ```

