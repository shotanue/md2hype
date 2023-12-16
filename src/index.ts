import { Root } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import * as TOML from "smol-toml";
import { unified } from "unified";
import YAML from "yaml";
import flatFilter from "unist-util-flat-filter";

const pickPreferences = (tree: Root) => {
  const parser = {
    yaml: (value: string): Record<string, unknown> => {
      return YAML.parse(value);
    },
    toml: (value: string): Record<string, unknown> => {
      return TOML.parse(value);
    },
  };

  const node = tree.children[0];
  const nodeType = node.type as "yaml" | "node" | string;

  if (nodeType === "yaml" || nodeType === "toml") {
    return { ...parser[nodeType]("value" in node ? node.value : "") };
  }

  return {};
};

export const getStdin = async (isTTY: boolean, stream: () => ReadableStream<Uint8Array>): Promise<string> => {
  if (!isTTY) {
    let text = "";
    for await (const chunk of stream()) {
      const chunkText = Buffer.from(chunk).toString();
      text = `${text}${chunkText}`;
    }
    return text;
  }

  return "";
};

import arg from "arg";
import chalkTemplate from "chalk-template";
import remarkRehype from "remark-rehype";

export const parseArguments = async (
  argv: string[],
  stdin: string,
): Promise<{ kind: "help" } | { kind: "stdin"; text: string } | { kind: "file"; path: string }> => {
  const args = arg(
    {
      "--help": Boolean,
      "--file": String,
    },
    { argv },
  );

  if (args["--help"]) {
    return {
      kind: "help",
    };
  }

  if (stdin !== "") {
    return {
      kind: "stdin",
      text: stdin,
    };
  }

  if (args["--file"]) {
    return {
      kind: "file",
      path: args["--file"],
    };
  }

  return {
    kind: "help",
  };
};

const helpText = (): string => {
  return chalkTemplate`{bold # md2hype}

{bold ## USAGE}

    {dim $} {bold md2hype} [--help, -h] --file {underline path}

{bold ## OPTIONS}
    --help, -h                  Shows this help message
    --file {underline path}                 Markdown file path
`;
};

const main = async () => {
  const result = await parseArguments(
    process.argv.slice(2),
    await getStdin(process.stdin.isTTY, () => Bun.stdin.stream()),
  );

  if (result.kind === "help") {
    console.log(helpText());
    process.exit(2);
  }

  const text = result.kind === "stdin" ? result.text : await Bun.file(result.path).text();

  const mdParser = unified().use(remarkParse).use(remarkBreaks).use(remarkFrontmatter, ["yaml", "toml"]).use(remarkGfm);

  const transformer = mdParser.use(remarkRehype).use(rehypeStringify);

  const html = String(await transformer.process(text));

  const mdast = mdParser.parse(text);

  const flattenTree = flatFilter<Root>(mdast, (node) => ["code", "heading", "yaml", "toml"].includes(node.type));

  const frontmatter = flattenTree === null ? {} : pickPreferences(flattenTree);

  const output = {
    html,
    frontmatter,
  };

  await Bun.write(Bun.stdout, JSON.stringify(output));
};

main();
