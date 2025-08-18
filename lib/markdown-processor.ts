import { extract } from "jsr:@std/front-matter/yaml";

export interface ProcessedMarkdown {
  content: string;
  frontMatter: Record<string, any>;
}

export class MarkdownProcessor {
  async processMarkdown(filePath: string): Promise<ProcessedMarkdown> {
    const text = await Deno.readTextFile(filePath);
    
    try {
      const { body, attrs } = extract(text);
      
      // Convert markdown to HTML
      const html = this.markdownToHtml(body);
      
      return {
        content: html,
        frontMatter: attrs as Record<string, any>
      };
    } catch (error) {
      // If no frontmatter, treat entire content as markdown
      return {
        content: this.markdownToHtml(text),
        frontMatter: {}
      };
    }
  }

  private markdownToHtml(markdown: string): string {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/^\s*(.+)/gm, (match, content) => {
      // Don't wrap already wrapped content
      if (content.startsWith('<') || content.trim() === '') {
        return content;
      }
      return content;
    });
    
    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>';
    }
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html.trim();
  }

  extractTemplateRefs(content: string): string[] {
    const templateMatches = content.matchAll(/<template\s+ref="([^"]+)"\s*\/>/g);
    return Array.from(templateMatches, match => match[1]);
  }

  hasTemplateRefs(content: string): boolean {
    return /<template\s+ref=/.test(content);
  }
}