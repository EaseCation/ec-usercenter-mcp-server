import { z } from "zod";

export const booleanLikeSchema = z.preprocess(value => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean());

export const ResultEnvelopeShape = {
  mode: z.enum(["admin", "user"]),
  endpoint: z.string(),
  summary: z.string(),
  data: z.unknown(),
};

export const ReadOnlyAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
};

export const ActionAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
};

function countRecords(data) {
  if (Array.isArray(data)) {
    return data.length;
  }

  if (Array.isArray(data?.data)) {
    return data.data.length;
  }

  if (Array.isArray(data?.result)) {
    return data.result.length;
  }

  if (Array.isArray(data?.records)) {
    return data.records.length;
  }

  return null;
}

export function deriveSummary(data) {
  const count = countRecords(data);

  if (count !== null) {
    return `返回 ${count} 条记录。`;
  }

  if (data?.EPF_description) {
    return String(data.EPF_description);
  }

  if (typeof data === "string") {
    return data.slice(0, 120);
  }

  return "请求成功。";
}

export function createStructuredResult({ mode, endpoint, data, summary }) {
  const resolvedSummary = summary || deriveSummary(data);
  const text = JSON.stringify(data, null, 2);

  return {
    structuredContent: {
      mode,
      endpoint,
      summary: resolvedSummary,
      data,
    },
    content: [
      {
        type: "text",
        text: `${resolvedSummary}\n\n${text}`,
      },
    ],
  };
}
