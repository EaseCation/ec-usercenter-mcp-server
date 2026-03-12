#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { config } from "../src/config.js";
import { createMcpServer } from "../src/mcp-server.js";

const { server } = createMcpServer({ config });
const client = new Client({ name: "smoke-client", version: "1.0.0" });
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

const tools = await client.listTools();
const toolNames = tools.tools.map(tool => tool.name);
console.log(JSON.stringify({ enabledTools: toolNames }, null, 2));

if (toolNames.includes("me_get_account_overview")) {
  const result = await client.callTool({ name: "me_get_account_overview", arguments: {} });
  if (result.isError) {
    throw new Error(result.content?.[0]?.text || "me_get_account_overview failed");
  }
  console.log(JSON.stringify({ me_get_account_overview: result.structuredContent?.summary }, null, 2));
}

if (toolNames.includes("admin_get_current_user")) {
  const result = await client.callTool({ name: "admin_get_current_user", arguments: {} });
  if (result.isError) {
    throw new Error(result.content?.[0]?.text || "admin_get_current_user failed");
  }
  console.log(JSON.stringify({ admin_get_current_user: result.structuredContent?.summary }, null, 2));
}

await server.close();
