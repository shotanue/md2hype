# md2hype

A text converter, markdown to html, powered by [unified.js](https://unifiedjs.com)

## Built-in unifiedjs plugins

for markdown parsing
- remark-breaks
- remark-frontmatter
- remark-gfm
- remark-parse

## Installation

WIP

Install the excutable, built by [bun.sh](https://bun.sh)

```bash
brew install shotanue/tap/md2hype
```

## How to use


```bash
md2hype --file foo.md
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

### If you want output only html

```bash
md2hype --file foo.md --html
```

```html
<p>hello world</p>
```


