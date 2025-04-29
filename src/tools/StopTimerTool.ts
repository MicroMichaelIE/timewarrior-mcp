import { execSync } from 'child_process';
import { z } from 'zod';

// Define the schema for the stop_timer tool
export const stopTimerSchema = z.object({
  tags: z.array(z.string()).optional().describe("Optional list of tags to stop tracking. If omitted or empty, stops all currently active tracking.")
});

// Define the handler function for the stop_timer tool
export async function stopTimerHandler(input: z.infer<typeof stopTimerSchema>) {
  const { tags } = input;

  let command = 'timew stop';
  let actionDescription = "all timers";

  // Check if specific tags are provided
  if (tags && tags.length > 0) {
    // Basic sanitization
    const sanitizedTags = tags
      .map(tag => tag.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim()) // Allow spaces, alphanumeric, hyphen, underscore
      .filter(tag => tag.length > 0);

    if (sanitizedTags.length > 0) {
      // Quote tags properly for the shell command
      command += ` ${sanitizedTags.map(t => `'${t.replace(/\'/g, "'\\''")}'`).join(' ')}`; // Use single quotes and escape internal single quotes
      actionDescription = `timer(s) with tags: ${sanitizedTags.join(', ')}`;
    } else {
      // If tags were provided but all were invalid after sanitization, default to stopping all.
      console.warn("Provided tags were invalid after sanitization. Stopping all timers.");
    }
  }

  try {
    // Execute the timew stop command
    const output = execSync(command, { encoding: 'utf8' });
    // Return the actual output from timew for more context
    return { content: [{ type: 'text' as const, text: output.trim() || `Attempted to stop ${actionDescription}.` }] };
  } catch (error: any) {
    console.error(`Error executing timew stop command: ${command}`, error);
    const errorMessage = error.stderr?.toString().trim() || error.message || `Unknown error stopping ${actionDescription}.`;
    // Return the error message as text content instead of throwing an error
    return { content: [{ type: 'text' as const, text: `Failed to stop timer: ${errorMessage}` }] };
  }
}
