import { z } from "zod";
import { execSync } from 'child_process';

// Define the schema for the start_timer tool
export const startTimerSchema = z.object({
  tags: z.array(z.string())
    .min(1, "At least one tag is required.")
    .describe("List of tags to associate with the new timer interval."),
});

// Define the handler function for the start_timer tool
export async function startTimerHandler(input: z.infer<typeof startTimerSchema>) {
  const { tags } = input;
  // Input validation (already handled by Zod schema min(1))

  // Basic sanitization
  const sanitizedTags = tags
    .map(tag => tag.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim()) // Allow spaces, alphanumeric, hyphen, underscore
    .filter(tag => tag.length > 0);

  if (sanitizedTags.length === 0) {
    throw new Error('No valid tags provided after sanitization. Please provide tags with letters, numbers, spaces, hyphens, or underscores.');
  }

  // Quote tags properly for the shell command
  const command = `timew start ${sanitizedTags.map(t => `'${t.replace(/'/g, "'\''")}'`).join(' ')}`; // Use single quotes and escape internal single quotes

  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(`Timewarrior start output: ${output}`);

    return {
      content: [
        {
          type: "text" as const, // Ensure type is literal 'text'
          text: `Timer started with tags: ${sanitizedTags.join(", ")}`,
        },
      ],
    };
  } catch (error: any) {
    console.error("Error starting Timewarrior timer:", error);
    const errorMessage = error.stderr?.toString().trim() || error.message || "Unknown error starting timer.";
    throw new Error(`Failed to start timer: ${errorMessage}`);
  }
}
