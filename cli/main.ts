import { parseArgs } from "std/cli/parse_args.ts";
import { Generator } from "../lib/generator.ts";

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["build", "dev", "help"],
    string: ["src", "dist"],
    default: {
      src: "./src",
      dist: "./dist"
    },
    alias: {
      h: "help",
      s: "src", 
      d: "dist"
    }
  });

  if (args.help) {
    console.log(`
HTML SSG - Static Site Generator

Usage:
  deno task build   Build the site
  deno task dev     Start development server
  
Options:
  --src <dir>       Source directory (default: ./src)
  --dist <dir>      Output directory (default: ./dist)
  --help, -h        Show this help
    `);
    return;
  }

  const generator = new Generator(args.src, args.dist);

  if (args.build) {
    console.log("Building site...");
    await generator.build();
    console.log("✅ Build complete!");
  } else if (args.dev) {
    console.log("Starting development server...");
    await generator.serve();
  } else {
    console.log("Use --build or --dev. Run with --help for usage.");
  }
}

if (import.meta.main) {
  main().catch(console.error);
}