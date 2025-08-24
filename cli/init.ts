import { ensureDir } from "jsr:@std/fs/ensure-dir";
import { join } from "jsr:@std/path/join";

export async function initProject() {
  console.log("🚀 Welcome to HTML SSG!");
  console.log();

  // Get project name
  const projectName = prompt("Project name:", "my-ssg-site") || "my-ssg-site";
  const projectDir = `./${projectName}`;

  // Ask about Tailwind
  const useTailwind = confirm("Add Tailwind CSS support?");

  console.log();
  console.log(`Creating project "${projectName}"...`);

  // Create directory structure
  await ensureDir(projectDir);
  await ensureDir(join(projectDir, "pages", "index"));
  await ensureDir(join(projectDir, "templates"));
  await ensureDir(join(projectDir, "data"));
  await ensureDir(join(projectDir, "static"));

  // Create site.html (root layout)
  const siteHtml = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title data-site="title"></title>
		<meta name="description" data-site-attr-content="description">
		<link rel="stylesheet" href="/styles.css">
	</head>
	<body${useTailwind ? ' class="bg-gray-50 min-h-screen"' : ''}>
		<template ref="header.html" />
		<main${useTailwind ? ' class="max-w-4xl mx-auto px-4 py-8"' : ''}>
			<slot />
		</main>
		<template ref="footer.html" />
	</body>
</html>`;

  await Deno.writeTextFile(join(projectDir, "site.html"), siteHtml);

  // Create homepage
  const homePage = `---
title: Welcome to ${projectName}
---

# Welcome to ${projectName}

This is your new HTML SSG site!

## Getting Started

1. Edit this file: \`pages/index/index.md\`
2. Add pages: \`pages/page-name/page-name.md\`
3. Customize templates in \`templates/\`
4. Run \`deno task dev\` to start the development server
`;

  await Deno.writeTextFile(join(projectDir, "pages", "index", "index.md"), homePage);

  // Create templates
  const headerTemplate = `<header${useTailwind ? ' class="bg-white shadow-sm border-b"' : ''}>
	<div${useTailwind ? ' class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between"' : ''}>
		<h1${useTailwind ? ' class="text-2xl font-bold text-gray-900"' : ''} data-site="title"></h1>
		<nav${useTailwind ? ' class="flex space-x-4"' : ''}>
			<a href="/"${useTailwind ? ' class="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"' : ''}>Home</a>
			<a href="/about"${useTailwind ? ' class="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"' : ''}>About</a>
		</nav>
	</div>
</header>`;

  const footerTemplate = `<footer${useTailwind ? ' class="mt-12 border-t bg-white"' : ''}>
	<div${useTailwind ? ' class="max-w-4xl mx-auto px-4 py-6"' : ''}>
		<p${useTailwind ? ' class="text-center text-gray-600"' : ''}>&copy; 2024 <span data-site="author"></span></p>
	</div>
</footer>`;

  await Deno.writeTextFile(join(projectDir, "templates", "header.html"), headerTemplate);
  await Deno.writeTextFile(join(projectDir, "templates", "footer.html"), footerTemplate);

  // Create site.json
  const siteData = {
    title: projectName,
    description: `A static site generated with HTML SSG`,
    author: "Your Name"
  };

  await Deno.writeTextFile(join(projectDir, "site.json"), JSON.stringify(siteData, null, 2));

  // Create basic CSS or Tailwind setup
  if (useTailwind) {
    const tailwindCss = `@import "tailwindcss";

/* Custom theme */
@theme {
  --color-brand: #3b82f6;
}

/* Component styles */
.prose {
  @apply max-w-none;
}

.prose h1 {
  @apply text-3xl font-bold text-gray-900 mb-4;
}

.prose h2 {
  @apply text-2xl font-semibold text-gray-800 mt-8 mb-3;
}

.prose p {
  @apply text-gray-700 mb-4 leading-relaxed;
}`;

    await Deno.writeTextFile(join(projectDir, "site.css"), tailwindCss);
  } else {
    const basicCss = `/* Basic styles for ${projectName} */
body {
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

header {
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
}

nav a {
  margin-right: 1rem;
  text-decoration: none;
  color: #666;
}

nav a:hover {
  color: #333;
}

footer {
  border-top: 1px solid #eee;
  margin-top: 2rem;
  padding-top: 1rem;
  text-align: center;
  color: #666;
}`;

    await Deno.writeTextFile(join(projectDir, "static", "styles.css"), basicCss);
  }

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
  console.log("Next steps:");
  console.log(`  cd ${projectName}`);
  
  if (useTailwind) {
    console.log("  deno task css       # Process Tailwind CSS");
    console.log("  deno task build:css  # Build with CSS processing");
  } else {
    console.log("  deno task build      # Build the site");
  }
  
  console.log("  deno task dev        # Start development server");
  console.log();
  console.log("Happy building! 🎉");
}