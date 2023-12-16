import arg from "arg";
import { template } from "chalk-template";
import helpText from "../resource/help.txt";
import { makeParser } from "./makeParser";

const getStdin = async (isTTY: boolean, stream: () => ReadableStream<Uint8Array>): Promise<string> => {
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

const parseArguments = async (
  argv: string[],
  stdin: string,
): Promise<
  { kind: "help" } | { kind: "stdin"; text: string; html: boolean } | { kind: "file"; path: string; html: boolean }
> => {
  const args = arg(
    {
      "--help": Boolean,
      "-h": "--help",
      "--file": String,
      "--html": Boolean,
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
      html: !!args["--html"],
    };
  }

  if (args["--file"]) {
    return {
      kind: "file",
      path: args["--file"],
      html: !!args["--html"],
    };
  }

  return {
    kind: "help",
  };
};

const result = await parseArguments(
  process.argv.slice(2),
  await getStdin(process.stdin.isTTY, () => Bun.stdin.stream()),
);

if (result.kind === "help") {
  await Bun.write(Bun.stdout, template(helpText));
  process.exit(2);
}

const mdText = result.kind === "stdin" ? result.text : await Bun.file(result.path).text();

const main = async (args: { mdText: string; html: boolean }): Promise<string> => {
  const { rehype, pickFrontmatter } = makeParser();

  const html = rehype(mdText);

  if (args.html) {
    return html;
  }

  const output = {
    html,
    frontmatter: pickFrontmatter(args.mdText),
  };

  return JSON.stringify(output);
};

await Bun.write(Bun.stdout, await main({ mdText, html: result.html }));
