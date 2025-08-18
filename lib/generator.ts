import { join, dirname, basename, extname } from "std/path/mod.ts";
import { ensureDir, walk } from "std/fs/mod.ts";
import { TemplateParser } from "./template-parser.ts";
import { DataBinder } from "./data-binder.ts";
import { TemplateIterator } from "./template-iterator.ts";
import { MarkdownProcessor } from "./markdown-processor.ts";

export class Generator {
  private templateParser = new TemplateParser();
  private dataBinder = new DataBinder();
  private templateIterator = new TemplateIterator(this.dataBinder, this.templateParser);
  private markdownProcessor = new MarkdownProcessor();
  private templateMap = new Map<string, string>();

  constructor(
    private srcDir: string,
    private distDir: string
  ) {}

  async build(): Promise<void> {
    await ensureDir(this.distDir);
    
    // Load all templates into memory
    await this.loadTemplates();
    
    // Process all pages
    await this.processPages();
    
    // Copy static files
    await this.copyStaticFiles();
  }

  async serve(): Promise<void> {
    await this.build();
    
    const server = Deno.serve({ port: 3000 }, async (req) => {
      const url = new URL(req.url);
      let filePath = join(this.distDir, url.pathname);
      
      // Default to index.html for directory requests
      if (url.pathname.endsWith("/")) {
        filePath = join(filePath, "index.html");
      }
      
      try {
        const content = await Deno.readTextFile(filePath);
        const contentType = this.getContentType(filePath);
        
        return new Response(content, {
          headers: { "content-type": contentType }
        });
      } catch {
        return new Response("404 Not Found", { 
          status: 404,
          headers: { "content-type": "text/plain" }
        });
      }
    });

    console.log("🚀 Server running on http://localhost:3000");
    await server.finished;
  }

  private async loadTemplates(): Promise<void> {
    const templatesDir = join(this.srcDir, "templates");
    
    try {
      for await (const entry of walk(templatesDir, { 
        exts: [".html"],
        includeDirs: false 
      })) {
        const content = await Deno.readTextFile(entry.path);
        const relativePath = "/" + entry.path.replace(this.srcDir + "/", "");
        this.templateMap.set(relativePath, content);
        
        // Also store by filename for easier referencing
        const filename = basename(entry.path);
        this.templateMap.set(filename, content);
      }
    } catch (error) {
      console.warn(`Templates directory not found: ${templatesDir}`);
    }
  }

  private async processPages(): Promise<void> {
    const pagesDir = join(this.srcDir, "pages");
    
    try {
      for await (const entry of walk(pagesDir, { 
        exts: [".md", ".html"],
        includeDirs: false 
      })) {
        await this.processPage(entry.path);
      }
    } catch (error) {
      console.warn(`Pages directory not found: ${pagesDir}`);
    }
  }

  private async processPage(filePath: string): Promise<void> {
    const ext = extname(filePath);
    const relativePath = filePath.replace(this.srcDir + "/pages/", "");
    
    // Enforce directory structure: pages/page-name/page-name.{md,html} -> page-name/index.html
    const baseName = basename(relativePath, ext);
    const dirName = dirname(relativePath);
    
    // Validate that file follows required structure
    if (dirName === "." || baseName !== basename(dirName)) {
      console.warn(`⚠️  Skipping ${relativePath} - must follow structure: page-name/page-name.${ext.slice(1)}`);
      return;
    }
    
    // All pages become directory indexes
    const outputPath = join(this.distDir, dirName, "index.html");

    // Ensure output directory exists
    await ensureDir(dirname(outputPath));

    let content: string;
    let frontMatter: Record<string, any> = {};

    // Process based on file type
    if (ext === ".md") {
      const processed = await this.markdownProcessor.processMarkdown(filePath);
      content = processed.content;
      frontMatter = processed.frontMatter;
    } else {
      content = await Deno.readTextFile(filePath);
    }

    // Load data sources
    const globalData = await this.dataBinder.loadGlobalData(this.srcDir);
    const dirData = await this.dataBinder.loadDirectoryData(dirname(filePath));
    
    // Structure data for template binding - global data goes under 'site' key
    const allData = this.dataBinder.mergeData(
      { site: globalData }, 
      dirData, 
      frontMatter
    );

    // Process template iterations
    content = await this.templateIterator.processNestedIterations(
      content,
      this.templateMap,
      allData
    );

    // Replace template refs
    content = this.templateParser.replaceTemplateRefs(content, this.templateMap);

    // Apply cascading layouts unless opted out
    if (!this.shouldSkipLayouts(content)) {
      content = await this.applyCascadingLayouts(content, dirname(filePath), allData);
    }

    // Final data binding pass
    content = this.dataBinder.bindData(content, allData);

    // Write the output file
    await Deno.writeTextFile(outputPath, content);
    console.log(`📝 Generated: ${outputPath}`);
  }



  private async copyStaticFiles(): Promise<void> {
    const staticDir = join(this.srcDir, "static");
    
    try {
      for await (const entry of walk(staticDir, { includeDirs: false })) {
        const relativePath = entry.path.replace(staticDir + "/", "");
        const outputPath = join(this.distDir, relativePath);  // Copy to root of dist
        
        await ensureDir(dirname(outputPath));
        await Deno.copyFile(entry.path, outputPath);
        console.log(`📁 Copied static: ${outputPath}`);
      }
    } catch {
      // Static directory is optional
    }
  }

  private shouldSkipLayouts(content: string): boolean {
    // Check if content has data-inherit-layouts="false"
    return /data-inherit-layouts\s*=\s*["']false["']/i.test(content);
  }

  private async applyCascadingLayouts(content: string, startDir: string, data: Record<string, any>): Promise<string> {
    const layouts = await this.discoverLayouts(startDir);
    
    // Apply layouts from most specific to least specific (innermost to outermost)
    for (const layoutPath of layouts.reverse()) {
      const layoutContent = await Deno.readTextFile(layoutPath);
      
      // Process layout templates and data bindings
      let processedLayout = await this.templateIterator.processNestedIterations(
        layoutContent,
        this.templateMap,
        data
      );
      
      processedLayout = this.templateParser.replaceTemplateRefs(
        processedLayout,
        this.templateMap
      );
      
      // Insert content into layout slots
      content = this.templateParser.insertIntoSlots(processedLayout, content);
    }
    
    return content;
  }

  private async discoverLayouts(startDir: string): Promise<string[]> {
    const layouts: string[] = [];
    let currentDir = startDir;
    
    // Walk up the directory tree looking for layout.html files
    while (currentDir.startsWith(this.srcDir)) {
      const layoutPath = join(currentDir, "layout.html");
      
      try {
        await Deno.stat(layoutPath);
        layouts.push(layoutPath);
      } catch {
        // Layout doesn't exist at this level, continue
      }
      
      // Move up one directory
      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir;
    }
    
    // Check for root site.html layout
    const rootLayoutPath = join(this.srcDir, "site.html");
    try {
      await Deno.stat(rootLayoutPath);
      layouts.push(rootLayoutPath);
    } catch {
      // No root layout
    }
    
    return layouts;
  }

  private getContentType(filePath: string): string {
    const ext = extname(filePath).toLowerCase();
    const types: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".txt": "text/plain",
      ".xml": "application/xml",
      ".pdf": "application/pdf",
      ".zip": "application/zip",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".webp": "image/webp"
    };
    return types[ext] || "application/octet-stream";
  }
}