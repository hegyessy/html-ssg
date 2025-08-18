#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import { parseArgs } from "https://deno.land/std@0.208.0/cli/parse_args.ts";
import { Generator } from "https://deno.land/x/html_ssg@latest/lib/generator.ts";

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["build", "dev", "help", "version"],
    string: ["src", "dist"],
    default: {
      src: "./src",
      dist: "./dist"
    },
    alias: {
      h: "help",
      s: "src", 
      d: "dist",
      v: "version"
    }
  });

  if (args.version) {
    console.log("HTML SSG v0.1.0");
    return;
  }

  if (args.help) {
    console.log(`
HTML SSG - Static Site Generator

Usage:
  htmlssg --build      Build the site
  htmlssg --dev        Start development server
  
Options:
  --src <dir>          Source directory (default: ./src)
  --dist <dir>         Output directory (default: ./dist)
  --help, -h           Show this help
  --version, -v        Show version
  
Examples:
  htmlssg --build
  htmlssg --dev --src ./my-site --dist ./output
    `);
    return;
  }

  const generator = new Generator(args.src, args.dist);

  if (args.build) {
    console.log("🔧 Building site...");
    await generator.build();
    console.log("✅ Build complete!");
  } else if (args.dev) {
    console.log("🚀 Starting development server...");
    await generator.serve();
  } else {
    console.log("Use --build or --dev. Run with --help for usage.");
  }
}

if (import.meta.main) {
  main().catch(console.error);
}