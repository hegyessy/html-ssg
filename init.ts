#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * HTML SSG Project Initializer
 * 
 * Usage:
 *   deno run -A -r https://raw.githubusercontent.com/hegyessy/html-ssg/refs/heads/master/init.ts
 */

import { ensureDir } from "jsr:@std/fs/ensure-dir";
import { join } from "jsr:@std/path/join";

async function main() {
  console.log("🚀 Welcome to HTML SSG!");
  console.log("   A modern static site generator using HTML standards");
  console.log();

  // Get project name
  const projectName = prompt("Project name:", "my-ssg-site") || "my-ssg-site";
  const projectDir = `./${projectName}`;

  // Check if directory exists
  try {
    await Deno.stat(projectDir);
    console.log(`❌ Directory "${projectName}" already exists!`);
    Deno.exit(1);
  } catch {
    // Directory doesn't exist, continue
  }

  // Ask about Tailwind
  const useTailwind = confirm("Add Tailwind CSS support?");

  console.log();
  console.log(`📁 Creating project "${projectName}"...`);

  // Create directory structure
  await ensureDir(projectDir);
  await ensureDir(join(projectDir, "pages", "index"));
  await ensureDir(join(projectDir, "templates"));
  await ensureDir(join(projectDir, "data"));
  await ensureDir(join(projectDir, "static"));

  console.log("   📄 Creating site layout...");

  // Create site.html (root layout)
  const siteHtml = `<!DOCTYPE html>
<html lang="en">
\t<head>
\t\t<meta charset="UTF-8">
\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0">
\t\t<title data-site="title"></title>
\t\t<meta name="description" data-site-attr-content="description">
\t\t<link rel="stylesheet" href="/styles.css">
\t</head>
\t<body${useTailwind ? ' class="bg-gray-50 min-h-screen"' : ''}>
\t\t<template ref="header.html" />
\t\t<main${useTailwind ? ' class="max-w-4xl mx-auto px-4 py-8"' : ''}>
\t\t\t<slot />
\t\t</main>
\t\t<template ref="footer.html" />
\t</body>
</html>`;

  await Deno.writeTextFile(join(projectDir, "site.html"), siteHtml);

  console.log("   📝 Creating homepage...");

  // Create homepage
  const homePage = `---
title: Welcome to ${projectName}
---

# Welcome to ${projectName}

This is your new HTML SSG site built with web standards!

## Features

- 🏗️ **HTML Template Tags**: Uses native \`<template>\` elements
- 📁 **File-based Routing**: \`pages/page-name/page-name.md\` → \`/page-name/\`
- 🎨 **Cascading Layouts**: Automatic layout inheritance
- 📊 **Data Binding**: JSON data with simple attribute syntax
- ⚡ **Fast Builds**: Powered by Deno${useTailwind ? '\n- 🎨 **Tailwind CSS**: Utility-first CSS framework' : ''}

## Getting Started

1. Edit this file: \`pages/index/index.md\`
2. Add new pages: \`pages/about/about.md\`
3. Customize templates in \`templates/\`
4. Run \`deno task dev\` to start developing

## Project Structure

\`\`\`
${projectName}/
├── site.html              # Root layout (inherited by all pages)
├── pages/
│   └── index/
│       └── index.md        # Homepage
├── templates/              # Reusable partials
│   ├── header.html
│   └── footer.html
├── data/                   # JSON data files
├── static/                 # Static assets
└── site.json               # Global site configuration
\`\`\`

Happy building! 🎉
`;

  await Deno.writeTextFile(join(projectDir, "pages", "index", "index.md"), homePage);

  console.log("   🧩 Creating templates...");

  // Create templates
  const headerTemplate = `<header${useTailwind ? ' class="bg-white shadow-sm border-b"' : ''}>
\t<div${useTailwind ? ' class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between"' : ''}>
\t\t<h1${useTailwind ? ' class="text-2xl font-bold text-gray-900"' : ''} data-site="title"></h1>
\t\t<nav${useTailwind ? ' class="flex space-x-4"' : ''}>
\t\t\t<a href="/"${useTailwind ? ' class="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"' : ''}>Home</a>
\t\t\t<a href="/about"${useTailwind ? ' class="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"' : ''}>About</a>
\t\t</nav>
\t</div>
</header>`;

  const footerTemplate = `<footer${useTailwind ? ' class="mt-12 border-t bg-white"' : ''}>
\t<div${useTailwind ? ' class="max-w-4xl mx-auto px-4 py-6"' : ''}>
\t\t<p${useTailwind ? ' class="text-center text-gray-600"' : ''}>&copy; 2024 <span data-site="author"></span></p>
\t</div>
</footer>`;

  await Deno.writeTextFile(join(projectDir, "templates", "header.html"), headerTemplate);
  await Deno.writeTextFile(join(projectDir, "templates", "footer.html"), footerTemplate);

  console.log("   ⚙️ Creating configuration...");

  // Create site.json
  const siteData = {
    title: projectName,
    description: `A static site generated with HTML SSG`,
    author: "Your Name"
  };

  await Deno.writeTextFile(join(projectDir, "site.json"), JSON.stringify(siteData, null, 2));

  // Create CSS
  if (useTailwind) {
    console.log("   🎨 Setting up Tailwind CSS...");
    
    const tailwindCss = `@import "tailwindcss";

/* Custom theme */
@theme {
  --color-brand: #3b82f6;
}

/* Typography */
.prose {
  @apply max-w-none;
}

.prose h1 {
  @apply text-3xl font-bold text-gray-900 mb-6;
}

.prose h2 {
  @apply text-2xl font-semibold text-gray-800 mt-8 mb-4;
}

.prose h3 {
  @apply text-xl font-medium text-gray-800 mt-6 mb-3;
}

.prose p {
  @apply text-gray-700 mb-4 leading-relaxed;
}

.prose ul {
  @apply list-disc list-inside text-gray-700 mb-4 space-y-1;
}

.prose ol {
  @apply list-decimal list-inside text-gray-700 mb-4 space-y-1;
}

.prose code {
  @apply bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm;
}

.prose pre {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.prose blockquote {
  @apply border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4;
}

.prose a {
  @apply text-blue-600 hover:text-blue-800 underline;
}`;

    await Deno.writeTextFile(join(projectDir, "site.css"), tailwindCss);
  } else {
    console.log("   🎨 Creating basic styles...");
    
    const basicCss = `/* Styles for ${projectName} */

/* Base styles */
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

/* Layout */
main {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
header {
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
  padding: 1rem 0;
}

header div {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
}

nav a {
  margin-left: 1rem;
  text-decoration: none;
  color: #666;
  padding: 0.5rem;
}

nav a:hover {
  color: #333;
}

/* Footer */
footer {
  border-top: 1px solid #eee;
  margin-top: 3rem;
  padding: 2rem 0;
  background: #f9f9f9;
}

footer div {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  color: #666;
}

/* Typography */
h1, h2, h3 {
  color: #222;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }

p {
  margin-bottom: 1rem;
}

ul, ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

li {
  margin-bottom: 0.25rem;
}

code {
  background: #f4f4f4;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.9em;
}

pre {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

pre code {
  background: none;
  padding: 0;
}

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #666;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}`;

    await Deno.writeTextFile(join(projectDir, "static", "styles.css"), basicCss);
  }

  console.log("   📋 Creating deno.json...");

  // Create deno.json
  const denoConfig: any = {
    name: projectName,
    version: "0.1.0",
    description: `HTML SSG project: ${projectName}`,
    tasks: {
      dev: "deno run --allow-read --allow-write --allow-net https://raw.githubusercontent.com/hegyessy/html-ssg/refs/heads/master/cli/main.ts --dev",
      build: "deno run --allow-read --allow-write https://raw.githubusercontent.com/hegyessy/html-ssg/refs/heads/master/cli/main.ts --build",
    },
    fmt: {
      useTabs: false,
      lineWidth: 80,
      indentWidth: 2
    },
    lint: {
      rules: {
        tags: ["recommended"]
      }
    }
  };

  if (useTailwind) {
    denoConfig.tasks.css = "deno run --allow-read --allow-write --allow-run --allow-ffi --allow-env npm:@tailwindcss/cli@^4.0.0 -i ./site.css -o ./static/styles.css";
    denoConfig.tasks["build:css"] = "deno task css && deno task build";
    denoConfig.imports = {
      "@tailwindcss/cli": "npm:@tailwindcss/cli@^4.0.0",
      "tailwindcss": "npm:tailwindcss@^4.0.0"
    };
    denoConfig.nodeModulesDir = "auto";
  }

  await Deno.writeTextFile(join(projectDir, "deno.json"), JSON.stringify(denoConfig, null, 2));

  console.log("   🙈 Creating .gitignore...");

  // Create .gitignore
  const gitignore = `# Build output
dist/
build/

# Deno
deno.lock
.deno/
node_modules/

# IDE/Editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
*.log

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Claude AI
.claude/
`;

  await Deno.writeTextFile(join(projectDir, ".gitignore"), gitignore);

  console.log();
  console.log("✅ Project created successfully!");
  console.log();
  console.log("📁 Project structure:");
  console.log(`   ${projectName}/`);
  console.log("   ├── site.html              # Root layout");
  console.log("   ├── pages/index/index.md   # Homepage");
  console.log("   ├── templates/              # Reusable partials");
  console.log("   ├── static/                 # Static assets");
  console.log("   └── deno.json               # Project configuration");
  console.log();
  console.log("🚀 Next steps:");
  console.log(`   cd ${projectName}`);
  
  if (useTailwind) {
    console.log("   deno task css       # Process Tailwind CSS");
    console.log("   deno task build:css  # Build with CSS processing");
  } else {
    console.log("   deno task build      # Build the site");
  }
  
  console.log("   deno task dev        # Start development server");
  console.log();
  console.log("📚 Learn more:");
  console.log("   https://github.com/hegyessy/html-ssg");
  console.log();
  console.log("Happy building! 🎉");
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Error:", error.message);
    Deno.exit(1);
  });
}