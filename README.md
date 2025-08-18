# HTML SSG

A static site generator library that uses HTML `<template>` tags for layouts and partials, embracing web standards.

## Quick Start

### Create a New Project

```bash
deno run -A -r https://raw.githubusercontent.com/hegyessy/html-ssg/main/init.ts
```

This will:
- Prompt for project name and Tailwind CSS preference
- Create a complete project structure
- Generate a ready-to-use HTML SSG site

### Manual Installation

#### As a Library

```typescript
import { Generator, buildSite } from "https://raw.githubusercontent.com/hegyessy/html-ssg/main/mod.ts";
```

#### As a CLI Tool

```bash
# Use directly
deno run --allow-read --allow-write --allow-net https://raw.githubusercontent.com/hegyessy/html-ssg/main/cli/main.ts --build
```

## Usage Examples

### Library Usage

```typescript
import { buildSite } from "https://raw.githubusercontent.com/hegyessy/html-ssg/main/mod.ts";

// Simple build
await buildSite({
  srcDir: "./src",
  distDir: "./dist"
});
```

```typescript
import { Generator } from "https://raw.githubusercontent.com/hegyessy/html-ssg/main/mod.ts";

// Advanced usage
const generator = new Generator("./src", "./dist");
await generator.build();

// Start development server
await generator.serve(); // Runs on localhost:3000
```

### CLI Usage

```bash
# Build site
htmlssg --build --src ./my-site --dist ./output

# Development server
htmlssg --dev --src ./my-site
```

## Site Structure

```
src/
├── site.html           # Root layout (inherited by all pages)
├── templates/          # Partials and template components
│   ├── header.html
│   ├── footer.html
│   └── post-item.html
├── pages/              # Content pages (markdown/html)
│   ├── blog/
│   │   ├── layout.html     # Blog section layout
│   │   ├── post-1/
│   │   │   └── post-1.md
│   │   └── post-2/
│   │       └── post-2.md
│   └── about/
│       └── about.md
├── data/               # JSON data files
│   └── posts.json
├── static/             # Static files (copied to site root)
│   ├── robots.txt
│   ├── favicon.ico
│   ├── sitemap.xml
│   └── .well-known/
│       └── security.txt
└── site.json           # Global site data
```

### Static Files

**Static Directory (`src/static/`)**
- Files copied directly to the site root
- Not processed by the build system
- Accessible at the root level of your site
- Examples: `robots.txt`, `favicon.ico`, `sitemap.xml`, `.well-known/` files

### CSS & JavaScript

HTML SSG focuses on HTML templating. For CSS and JavaScript processing, use your preferred tools:

- **CSS**: Use Sass, PostCSS, or build tools like Vite/esbuild
- **JavaScript**: Use TypeScript, esbuild, or bundlers like Rollup
- **Assets**: Process with your build tool and output to `static/` or reference externally

## Template System

### Layouts

Layouts use a cascading hierarchy based on the file system:

**Root Layout (`src/site.html`)**
```html
<!DOCTYPE html>
<html>
  <head>
    <title data-site="title"></title>
  </head>
  <body>
    <template ref="header.html" />
    <main>
      <slot />
    </main>
    <template ref="footer.html" />
  </body>
</html>
```

**Section Layout (`src/pages/blog/layout.html`)**
```html
<div class="blog-layout">
  <template ref="blog-header.html" />
  <slot />
  <template ref="blog-footer.html" />
</div>
```

Layouts automatically cascade from most specific to least specific. Pages inherit all layouts in their directory path up to the root.

### Data Binding

```html
<!-- Content binding -->
<h1 data-site="title"></h1>

<!-- Attribute binding -->
<a data-post-attr-href="url" data-post-attr-title="title" data-post="title"></a>
```

### Opting Out of Layouts

To prevent a page from inheriting layouts, add the `data-inherit-layouts="false"` attribute:

```html
<div data-inherit-layouts="false">
  <!-- This content won't be wrapped in any layouts -->
  <h1>Standalone Page</h1>
</div>
```

### Template Iteration

```html
<ul>
<template data-src="/data/posts.json" data-for-each="featured" data-do="post">
  <template ref="post-item.html" />
</template>
</ul>
```

### Partials

Partials are any `.html` files in the `/templates/` directory that aren't named `layout.html`. Reference them using `<template ref="filename.html" />`.

### Markdown with Frontmatter

```markdown
---
title: My Blog Post
---

# Hello World

Content goes here.

<template ref="related-posts.html" />
```

**Note:** Frontmatter no longer needs `layout` specification since layouts cascade automatically.

## Template Attributes

- `id`: Unique template identifier
- `ref`: Reference to another template file
- `data-src`: JSON data source for template
- `data-for-each`: Array key to iterate over
- `data-do`: Variable name for iteration items
- `slot`: Content insertion point

## Data Binding Syntax

- `data-[source]="key"` - Insert text content
- `data-[source]-attr-[attr]="key"` - Set attribute value

## File Routing

HTML SSG enforces a consistent directory structure for all pages:

- `/pages/page-name/page-name.md` → `/page-name/index.html`
- `/pages/blog/blog.md` → `/blog/index.html`
- `/pages/about/about.html` → `/about/index.html`

**Required Structure:** All pages must follow the pattern `pages/page-name/page-name.{md,html}`. Files not following this structure will be skipped with a warning.

## Data Sources

- `/site.json` - Global site data available everywhere
- `/pages/directory/data.json` - Directory-specific data
- Frontmatter in markdown files - Page-specific data

Data is structured hierarchically and can specify layouts for entire directory trees.

## API Reference

### Generator Class

```typescript
class Generator {
  constructor(srcDir: string, distDir: string)
  
  async build(): Promise<void>
  async serve(): Promise<void>
}
```

### Convenience Functions

```typescript
// Build a site
async function buildSite(config: SSGConfig): Promise<void>

// Start development server
async function serveSite(config: SSGConfig, port?: number): Promise<void>
```

### Configuration

```typescript
interface SSGConfig {
  srcDir: string;
  distDir: string;
  templatesDir?: string;
  pagesDir?: string;
  dataDir?: string;
  staticDir?: string;
}
```

## Deployment

HTML SSG generates static files that can be deployed to any static hosting provider:

- **Deno Deploy**: Use the new static site support (beta)
- **Netlify**: Deploy the `dist/` directory
- **Vercel**: Deploy the `dist/` directory  
- **GitHub Pages**: Deploy the `dist/` directory
- **Any CDN or web server**: Serve the `dist/` directory

## Development

```bash
# Run example site
deno task dev:example

# Build example
deno task build:example


# Run tests
deno task test
```

## Example Integration

```typescript
// Custom build script
import { Generator } from "https://raw.githubusercontent.com/hegyessy/html-ssg/main/mod.ts";

const generator = new Generator("./src", "./dist");

// Add custom processing
await generator.build();

console.log("Site built successfully!");
```