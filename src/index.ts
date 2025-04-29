import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// Import schemas and handlers from tool files
import { startTimerSchema, startTimerHandler } from "./tools/StartTimerTool.js";
import { stopTimerSchema, stopTimerHandler } from "./tools/StopTimerTool.js";
import { getSummarySchema, getSummaryHandler } from "./tools/GetSummaryTool.js";
import { listTagsSchema, listTagsHandler } from "./tools/ListTagsTool.js"; // Import new tool

// Create server instance
const server = new McpServer({
  name: "timewarrior-mcp-server", // Updated name for clarity
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register the start_timer tool using the shape of the imported schema
server.tool(
  "start_timer",
  "Starts a new Timewarrior timer interval with the specified tags. MUST use list_tags first to ensure consistent tags.",
  startTimerSchema.shape,
  startTimerHandler
);
console.log("Registered start_timer tool");

// Register the stop_timer tool using the shape of the imported schema
server.tool(
  "stop_timer",
  "Stops the currently running Timewarrior interval.",
  stopTimerSchema.shape,
  stopTimerHandler
);
console.log("Registered stop_timer tool");

// Register the get_summary tool
server.tool(
  "get_summary",
  "Generates an aggregate report of tracked time, optionally filtered by range and/or tags.",
  getSummarySchema.shape,
  getSummaryHandler
);
console.log("Registered get_summary tool");

// Register the list_tags tool
server.tool(
  "list_tags",
  "Lists tags used in Timewarrior intervals. Use this before starting a timer to ensure similar tags are repeated for better reporting. Optionally filtered by a date range.",
  listTagsSchema.shape,
  listTagsHandler
);
console.log("Registered list_tags tool");

// Remove the old registration call
// registerTimerTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Timewarrior MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
