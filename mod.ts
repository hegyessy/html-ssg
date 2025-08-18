// HTML SSG - Static Site Generator Library
// Main library exports

export { Generator } from "./lib/generator.ts";
export { TemplateParser } from "./lib/template-parser.ts";
export { DataBinder } from "./lib/data-binder.ts";
export { TemplateIterator } from "./lib/template-iterator.ts";
export { MarkdownProcessor } from "./lib/markdown-processor.ts";

export type { ParsedTemplate } from "./lib/template-parser.ts";
export type { ProcessedMarkdown } from "./lib/markdown-processor.ts";

// Configuration interfaces
export interface SSGConfig {
  srcDir: string;
  distDir: string;
  templatesDir?: string;
  pagesDir?: string;
  dataDir?: string;
  staticDir?: string;
}

// Convenience function for basic usage
export async function buildSite(config: SSGConfig): Promise<void> {
  const generator = new Generator(config.srcDir, config.distDir);
  await generator.build();
}

// Convenience function for development server
export async function serveSite(config: SSGConfig, port = 3000): Promise<void> {
  const generator = new Generator(config.srcDir, config.distDir);
  await generator.serve();
}