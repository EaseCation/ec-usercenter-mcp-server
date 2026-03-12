#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const [infoPath, functionPath, triggerPath] = process.argv.slice(2);

if (!infoPath || !functionPath || !triggerPath) {
  console.error("用法: node scripts/verify-fc-deploy.mjs <fc-info.json> <fc-function.json> <fc-triggers.json>");
  process.exit(1);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const [info, fn, triggers] = await Promise.all([
    readJson(infoPath),
    readJson(functionPath),
    readJson(triggerPath),
  ]);

  const triggerList = triggers?.triggers || [];
  const httpTrigger = triggerList.find(trigger => trigger.triggerName === "httpTrigger");

  assert(fn?.runtime === "custom.debian10", "函数 runtime 不是 custom.debian10。");
  assert(fn?.customRuntimeConfig?.command?.join(" ") === "npm start", "函数启动命令不是 npm start。");
  assert(fn?.customRuntimeConfig?.port === 3000, "函数端口不是 3000。");
  assert(httpTrigger, "未找到 httpTrigger。");
  assert(info?.url?.system_url, "s info 未返回 system_url。");

  console.log(
    JSON.stringify(
      {
        functionName: fn.functionName,
        runtime: fn.runtime,
        port: fn.customRuntimeConfig.port,
        systemUrl: info.url.system_url,
        triggerNames: triggerList.map(trigger => trigger.triggerName),
      },
      null,
      2
    )
  );
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
