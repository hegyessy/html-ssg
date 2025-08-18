import { DOMParser } from "@deno-dom";

export interface ParsedTemplate {
  id?: string;
  ref?: string;
  dataSrc?: string;
  dataForEach?: string;
  dataDo?: string;
  slot?: string;
  content: string;
  element: Element;
}

export class TemplateParser {
  private parser = new DOMParser();

  parseTemplate(html: string): ParsedTemplate[] {
    const doc = this.parser.parseFromString(html, "text/html");
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    const templates = doc.querySelectorAll("template");
    
    return Array.from(templates).map(template => ({
      id: template.getAttribute("id") || undefined,
      ref: template.getAttribute("ref") || undefined,
      dataSrc: template.getAttribute("data-src") || undefined,
      dataForEach: template.getAttribute("data-for-each") || undefined,
      dataDo: template.getAttribute("data-do") || undefined,
      slot: template.getAttribute("slot") || undefined,
      content: template.innerHTML,
      element: template
    }));
  }

  extractDataBindings(html: string): Array<{
    type: "content" | "attribute";
    dataSource: string;
    key: string;
    attributeName?: string;
    fullMatch: string;
  }> {
    const bindings = [];
    
    // Match content bindings: data-site="title"
    const contentMatches = html.matchAll(/data-(\w+)="(\w+)"/g);
    for (const match of contentMatches) {
      bindings.push({
        type: "content" as const,
        dataSource: match[1],
        key: match[2],
        fullMatch: match[0]
      });
    }

    // Match attribute bindings: data-trip-attr-href="href"
    const attrMatches = html.matchAll(/data-(\w+)-attr-(\w+)="(\w+)"/g);
    for (const match of attrMatches) {
      bindings.push({
        type: "attribute" as const,
        dataSource: match[1],
        key: match[3],
        attributeName: match[2],
        fullMatch: match[0]
      });
    }

    return bindings;
  }

  replaceTemplateRefs(html: string, templateMap: Map<string, string>): string {
    let result = html;
    
    // Replace template ref imports: <template ref="/path/to/template.html" />
    result = result.replace(
      /<template\s+ref="([^"]+)"\s*\/>/g,
      (match, ref) => {
        const templateContent = templateMap.get(ref);
        if (templateContent) {
          // Extract just the inner content of the template
          const innerContent = templateContent.replace(/<template[^>]*>([\s\S]*?)<\/template>/g, '$1');
          return innerContent;
        }
        return `<!-- Template not found: ${ref} -->`;
      }
    );

    return result;
  }

  insertIntoSlots(layoutHtml: string, content: string): string {
    // Replace <slot /> with content
    return layoutHtml.replace(/<slot\s*\/>/g, content);
  }
}