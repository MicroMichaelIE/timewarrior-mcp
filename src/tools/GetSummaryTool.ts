import { z } from "zod";
import { execSync } from 'child_process';

// Define the schema for the get_summary tool
export const getSummarySchema = z.object({
  range: z.string().optional().describe("Optional date range or range hint (e.g., 'today', 'this.week', '1 day', '2025-04-20..2025-04-29'). Defaults to 'day'."),
  tags: z.array(z.string()).optional().describe("Optional list of tags to filter the summary by."),
  showIds: z.boolean().optional().default(true).describe("Whether to include the 'ID' column in the summary. Defaults to true.")
});

// Define the handler function for the get_summary tool
export async function getSummaryHandler(input: z.infer<typeof getSummarySchema>) {
  const { range, tags, showIds } = input;

  let command = 'timew summary';

  // Add hints
  if (showIds) {
    command += ' :ids';
  }

  // Add range if provided
  if (range) {
    // Basic validation/sanitization for range - avoid command injection
    // Allow alphanumeric, periods, colons, hyphens, spaces
    const sanitizedRange = range.replace(/[^a-zA-Z0-9\.:\-\s]/g, '').trim();
    if (sanitizedRange) {
      command += ` '${sanitizedRange.replace(/'/g, "'\\\''")}'`; // Quote and escape internal single quotes
    }
  }

  // Add tags if provided
  if (tags && tags.length > 0) {
    const sanitizedTags = tags
      .map(tag => tag.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim()) // Allow spaces, alphanumeric, hyphen, underscore
      .filter(tag => tag.length > 0);

    if (sanitizedTags.length > 0) {
      command += ` ${sanitizedTags.map(t => `'${t.replace(/'/g, "'\\\''")}'`).join(' ')}`;
    }
  }

  try {
    // Execute the timew summary command
    const output = execSync(command, { encoding: 'utf8' });
    return { content: [{ type: 'text' as const, text: output.trim() }] };
  } catch (error: any) {
    console.error(`Error executing timew summary command: ${command}`, error);
    const errorMessage = error.stderr?.toString().trim() || error.message || "Unknown error getting summary.";
    throw new Error(`Failed to get summary: ${errorMessage}`);
  }
}
