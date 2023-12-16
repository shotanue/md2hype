import { Root } from "mdast";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import * as TOML from "smol-toml";
import { unified } from "unified";
import flatFilter from "unist-util-flat-filter";
import YAML from "yaml";

export const makeParser = () => {
  const mdParser = unified().use(remarkParse).use(remarkBreaks).use(remarkFrontmatter, ["yaml", "toml"]).use(remarkGfm);

  return {
    rehype: (text: string): string => String(mdParser.use(remarkRehype).use(rehypeStringify).processSync(text)),
    pickFrontmatter: (text: string): Record<string, unknown> => {
      const mdast = mdParser.parse(text);

      const flattenTree = flatFilter<Root>(mdast, (node) => ["code", "heading", "yaml", "toml"].includes(node.type));

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

      const frontmatter = flattenTree === null ? {} : pickPreferences(flattenTree);

      return frontmatter;
    },
  };
};
