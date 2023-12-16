# md2hype

A text converter, markdown to html, powered by [unified.js](https://unifiedjs.com)

## Installation

WIP

Install single binary built by [bun.sh](https://bun.sh)

```bash
brew install shotanue/tap/md2hype
```

## How to use


```bash
md2hype foo.md
```

- foo.md

```md
---
tag:
  - foo
---
hello world
```

- output

```json
{
  "html": "<p>hello world</p>",
  "frontmatter": {
    "tag": ["foo"]
  }
}
```

### only html output

```bash
md2hype foo.md --html
```

```html
<p>hello world</p>
```


