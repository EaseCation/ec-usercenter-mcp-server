import assert from "node:assert/strict";
import test from "node:test";
import { resolveConfig } from "../src/config.js";

test("streamable-http falls back to PORT and 0.0.0.0 for hosted runtimes", () => {
  const config = resolveConfig({
    EC_USER_REFRESH_TOKEN: "user-refresh-token",
    MCP_TRANSPORT: "streamable-http",
    PORT: "3000",
  });

  assert.equal(config.http.port, 3000);
  assert.equal(config.http.host, "0.0.0.0");
  assert.deepEqual(config.enabledModes, ["user"]);
});
