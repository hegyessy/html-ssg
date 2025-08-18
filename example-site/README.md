# Example HTML SSG Site

This is an example site demonstrating the HTML SSG library features.

## Project Structure

```
example-site/
├── templates/          # HTML template files
│   ├── site.layout.html
│   ├── _site-header.html
│   └── _site-footer.html
├── pages/              # Content pages (markdown/html)
│   └── index.md
├── data/               # JSON data files
│   └── trips.json
└── site.json           # Global site data
```

## Build Commands

```bash
# From the root directory
deno task build:example    # Build the example site
deno task dev:example      # Start development server
```

## Features Demonstrated

- ✅ HTML template layouts with slots
- ✅ Template partials and imports
- ✅ Data binding with JSON files
- ✅ Template iteration (data-for-each/data-do)
- ✅ Markdown processing with frontmatter
- ✅ Development server with hot reload