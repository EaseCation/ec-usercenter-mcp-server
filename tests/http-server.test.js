import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createHttpApp } from "../src/http-server.js";

function createHttpTestConfig({ bearerToken = "" } = {}) {
  return {
    serverInfo: {
      name: "ec-usercenter-mcp-server",
      version: "test",
    },
    instructions: "test",
    apiTimeoutMs: 1_000,
    transport: "streamable-http",
    enabledModes: ["user"],
    modes: {
      admin: {
        enabled: false,
        baseUrl: "http://localhost:9000",
        token: "",
        refreshToken: "",
      },
      user: {
        enabled: true,
        baseUrl: "http://localhost:9000",
        token: "user-token",
        refreshToken: "user-refresh-token",
      },
    },
    http: {
      host: "127.0.0.1",
      port: 3100,
      path: "/mcp",
      corsOrigin: "*",
      enableDnsRebindingProtection: false,
      bearerToken,
    },
  };
}

async function withServer(app, callback) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await callback(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close(error => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

function parseMcpResponse(text, contentType) {
  if ((contentType || "").includes("text/event-stream")) {
    const payloads = text
      .split("\n")
      .filter(line => line.startsWith("data:"))
      .map(line => line.slice(5).trim())
      .filter(Boolean);

    assert.ok(payloads.length > 0);
    return JSON.parse(payloads.at(-1));
  }

  return JSON.parse(text);
}

test("health endpoint remains public when bearer auth is enabled", async () => {
  const app = createHttpApp({ config: createHttpTestConfig({ bearerToken: "secret-token" }) });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/healthz`);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.authRequired, true);
  });
});

test("mcp endpoint requires bearer token when configured", async () => {
  const app = createHttpApp({ config: createHttpTestConfig({ bearerToken: "secret-token" }) });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "tools-list",
        method: "tools/list",
        params: {},
      }),
    });

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.error.message, "Unauthorized");
  });
});

test("mcp endpoint serves requests when bearer token is valid", async () => {
  const app = createHttpApp({ config: createHttpTestConfig({ bearerToken: "secret-token" }) });

  await withServer(app, async baseUrl => {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "X-Mcp-Bearer-Token": "secret-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "tools-list",
        method: "tools/list",
        params: {},
      }),
    });

    assert.equal(response.status, 200);
    const body = parseMcpResponse(await response.text(), response.headers.get("content-type"));
    assert.ok(Array.isArray(body.result.tools));
    assert.ok(body.result.tools.some(tool => tool.name === "me_get_current_user"));
  });
});
