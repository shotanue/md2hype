import { beforeEach, describe, expect, test } from "bun:test";
import { makeParser } from "./makeParser";

describe("html conversion", () => {
  let rehype: ReturnType<typeof makeParser>["rehype"];

  beforeEach(() => {
    rehype = makeParser().rehype;
  });

  test("converts markdown to HTML correctly", () => {
    const markdown = "# Hello World\n\nThis is a *test*.";
    const expectedHtml = "<h1>Hello World</h1>\n<p>This is a <em>test</em>.</p>";

    expect(rehype(markdown)).toBe(expectedHtml);
  });

  test("handles empty markdown string", () => {
    const markdown = "";
    const expectedHtml = "";

    expect(rehype(markdown)).toBe(expectedHtml);
  });

  test("handles complex markdown structure", () => {
    const markdown = "# Heading\n\n- List item 1\n- List item 2\n\n> Blockquote";
    const expectedHtml =
      "<h1>Heading</h1>\n<ul>\n<li>List item 1</li>\n<li>List item 2</li>\n</ul>\n<blockquote>\n<p>Blockquote</p>\n</blockquote>";

    expect(rehype(markdown)).toBe(expectedHtml);
  });
});

describe("frontmatter extraction", () => {
  let pickFrontmatter: ReturnType<typeof makeParser>["pickFrontmatter"];

  beforeEach(() => {
    pickFrontmatter = makeParser().pickFrontmatter;
  });

  test("extracts YAML frontmatter correctly", () => {
    const markdown = `---
title: Test Title
---
# Hello World`;

    const expectedFrontmatter = { title: "Test Title" };

    expect(pickFrontmatter(markdown)).toEqual(expectedFrontmatter);
  });

  test("extracts TOML frontmatter correctly", () => {
    const markdown = `+++
title = "Test Title"
+++
# Hello World`;

    const expectedFrontmatter = { title: "Test Title" };

    expect(pickFrontmatter(markdown)).toEqual(expectedFrontmatter);
  });

  test("handles markdown without frontmatter", () => {
    const markdown = "# No Frontmatter\n\nJust text.";
    const expectedFrontmatter = {};

    expect(pickFrontmatter(markdown)).toEqual(expectedFrontmatter);
  });

  test("handles invalid frontmatter", () => {
    const markdown = `---
not: valid frontmatter
-- - 
# Invalid Frontmatter`;
    const expectedFrontmatter = {};

    expect(pickFrontmatter(markdown)).toEqual(expectedFrontmatter);
  });

  test("handles frontmatter with various data types", () => {
    const markdown = `---
title: Test Title
number: 42
boolean: true
array:
  - item1
  - item2
nested:
  key: value
---
# Complex Frontmatter`;

    const expectedFrontmatter = {
      title: "Test Title",
      number: 42,
      boolean: true,
      array: ["item1", "item2"],
      nested: { key: "value" },
    };

    expect(pickFrontmatter(markdown)).toEqual(expectedFrontmatter);
  });
});
