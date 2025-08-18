export class DataBinder {
  async loadData(path: string): Promise<Record<string, any>> {
    try {
      const content = await Deno.readTextFile(path);
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return {};
      }
      throw new Error(`Failed to load data from ${path}: ${error.message}`);
    }
  }

  async loadGlobalData(srcDir: string): Promise<Record<string, any>> {
    const sitePath = `${srcDir}/site.json`;
    return await this.loadData(sitePath);
  }

  async loadDirectoryData(dirPath: string): Promise<Record<string, any>> {
    const dataPath = `${dirPath}/data.json`;
    return await this.loadData(dataPath);
  }

  bindData(html: string, data: Record<string, any>): string {
    let result = html;

    // Handle attribute bindings first: data-trip-attr-href="href" becomes href="value"
    result = result.replace(
      /data-(\w+)-attr-(\w+)="(\w+)"/g,
      (match, dataSource, attrName, key) => {
        const value = data[dataSource]?.[key] || "";
        return `${attrName}="${value}"`;
      }
    );

    // Handle content bindings: data-site="title" - inject content into element
    result = result.replace(
      /(<[^>]+?)data-(\w+)="(\w+)"([^>]*?>)/g,
      (match, openTag, dataSource, key, restOfTag) => {
        const value = data[dataSource]?.[key] || "";
        // Remove the data attribute and inject the value as content
        const cleanedTag = (openTag + restOfTag).replace(/\s*data-\w+-?\w*="[^"]*"/g, '');
        
        // If it's a self-closing tag, just clean it
        if (cleanedTag.endsWith('/>')) {
          return cleanedTag;
        }
        
        // For regular tags, inject the value as content
        return cleanedTag + value;
      }
    );

    return result;
  }

  mergeData(...dataSources: Record<string, any>[]): Record<string, any> {
    return Object.assign({}, ...dataSources);
  }

  createIterationData(
    parentData: Record<string, any>,
    iterationVariable: string,
    itemData: any
  ): Record<string, any> {
    return {
      ...parentData,
      [iterationVariable]: itemData
    };
  }
}