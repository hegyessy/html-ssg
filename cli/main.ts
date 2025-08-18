import { parseArgs } from "jsr:@std/cli/parse-args";
import { Generator } from "https://raw.githubusercontent.com/hegyessy/html-ssg/refs/heads/master/lib/generator.ts";
import { initProject } from "https://raw.githubusercontent.com/hegyessy/html-ssg/refs/heads/master/cli/init.ts";

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["build", "dev", "help", "init"],
    string: ["src", "dist"],
    default: {
      src: ".",
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
  deno task init    Initialize a new HTML SSG project
  deno task build   Build the site
  deno task dev     Start development server
  
Options:
  --src <dir>       Source directory (default: .)
  --dist <dir>      Output directory (default: ./dist)
  --help, -h        Show this help
    `);
    return;
  }

  if (args.init) {
    await initProject();
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
    console.log("Use --init, --build, or --dev. Run with --help for usage.");
  }
}

if (import.meta.main) {
  main().catch(console.error);
}