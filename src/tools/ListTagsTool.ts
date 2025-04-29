import { z } from "zod";
import { execSync } from 'child_process';

// Define the schema for the list_tags tool
export const listTagsSchema = z.object({
  range: z.string().optional().describe("Optional date range or range hint to filter tags used within that period (e.g., 'today', 'this.week', '1 day', '2025-04-20..2025-04-29'). If omitted, lists all tags ever used.")
});

// Define the handler function for the list_tags tool
export async function listTagsHandler(input: z.infer<typeof listTagsSchema>) {
  const { range } = input;

  let command = 'timew tags';

  // Add range if provided
  if (range) {
    // Basic validation/sanitization for range
    const sanitizedRange = range.replace(/[^a-zA-Z0-9\.:\-\s]/g, '').trim();
    if (sanitizedRange) {
      command += ` '${sanitizedRange.replace(/'/g, "'\\\''")}'`; // Quote and escape internal single quotes
    }
  }

  try {
    // Execute the timew tags command
    const output = execSync(command, { encoding: 'utf8' });
    // The output is a list of tags, one per line. Return as newline-separated text.
    const tagsList = output.trim(); // Keep the newline separation
    return { content: [{ type: 'text' as const, text: tagsList || "No tags found." }] };
  } catch (error: any) {
    console.error(`Error executing timew tags command: ${command}`, error);
    const errorMessage = error.stderr?.toString().trim() || error.message || "Unknown error listing tags.";
    // Return the error message as text content
    return { content: [{ type: 'text' as const, text: `Failed to list tags: ${errorMessage}` }] };
  }
}
