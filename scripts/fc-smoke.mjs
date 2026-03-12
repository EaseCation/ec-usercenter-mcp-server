#!/usr/bin/env node

import { readFile } from "node:fs/promises";

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) {
    return null;
  }
  return process.argv[index + 1];
}

function normalizeBaseUrl(url) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `https://${url}`;
}

async function resolveBaseUrl() {
  const directUrl = getArg("--url");
  if (directUrl) {
    return normalizeBaseUrl(directUrl);
  }

  const infoPath = getArg("--info");
  if (!infoPath) {
    throw new Error("请通过 --url 或 --info 提供函数地址。");
  }

  const info = JSON.parse(await readFile(infoPath, "utf8"));
  return normalizeBaseUrl(info?.url?.system_url || info?.url?.custom_domain);
}

async function main() {
  const baseUrl = await resolveBaseUrl();
  if (!baseUrl) {
    throw new Error("无法从部署信息中解析函数地址。");
  }

  const healthUrl = new URL("/healthz", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
  const response = await fetch(healthUrl, {
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
  }

  if (!response.ok) {
    throw new Error(`健康检查失败 (${response.status}): ${typeof body === "string" ? body : JSON.stringify(body)}`);
  }

  console.log(
    JSON.stringify(
      {
        baseUrl,
        healthUrl,
        status: response.status,
        body,
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
