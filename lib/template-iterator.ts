import { DataBinder } from "./data-binder.ts";
import { TemplateParser } from "./template-parser.ts";

export class TemplateIterator {
  constructor(
    private dataBinder: DataBinder,
    private templateParser: TemplateParser
  ) {}

  async processIteration(
    html: string,
    dataSrc: string,
    forEachKey: string,
    doVariable: string,
    templateMap: Map<string, string>,
    parentData: Record<string, any> = {}
  ): Promise<string> {
    // Load the data source
    const data = await this.dataBinder.loadData(dataSrc);
    const items = data[forEachKey];

    if (!Array.isArray(items)) {
      console.warn(`Data source ${dataSrc} does not contain an array for key ${forEachKey}`);
      return "";
    }

    let result = "";

    // Process each item in the array
    for (const item of items) {
      // Create iteration-specific data context
      const iterationData = this.dataBinder.createIterationData(
        parentData,
        doVariable,
        item
      );

      // Process the template content for this iteration
      let iterationHtml = html;

      // Replace any template refs within the iteration
      iterationHtml = this.templateParser.replaceTemplateRefs(
        iterationHtml,
        templateMap
      );

      // Bind the data for this iteration
      iterationHtml = this.dataBinder.bindData(iterationHtml, iterationData);

      result += iterationHtml;
    }

    return result;
  }

  async processNestedIterations(
    html: string,
    templateMap: Map<string, string>,
    allData: Record<string, any>
  ): Promise<string> {
    let result = html;

    // Find all template tags with data-for-each
    const iterationMatches = result.matchAll(
      /<template\s+[^>]*data-for-each="([^"]+)"[^>]*>(.*?)<\/template>/gs
    );

    for (const match of iterationMatches) {
      const fullMatch = match[0];
      const forEachKey = match[1];
      const templateContent = match[2];

      // Extract other attributes from the template tag
      const dataSrcMatch = fullMatch.match(/data-src="([^"]+)"/);
      const dataDoMatch = fullMatch.match(/data-do="([^"]+)"/);

      if (!dataSrcMatch || !dataDoMatch) {
        console.warn("Template iteration missing required data-src or data-do attributes");
        continue;
      }

      const dataSrc = dataSrcMatch[1];
      const doVariable = dataDoMatch[1];

      try {
        // Process this iteration
        const processedIteration = await this.processIteration(
          templateContent,
          dataSrc,
          forEachKey,
          doVariable,
          templateMap,
          allData
        );

        // Replace the template tag with the processed content
        result = result.replace(fullMatch, processedIteration);
      } catch (error) {
        console.error(`Error processing iteration: ${error.message}`);
        result = result.replace(fullMatch, `<!-- Error: ${error.message} -->`);
      }
    }

    return result;
  }
}