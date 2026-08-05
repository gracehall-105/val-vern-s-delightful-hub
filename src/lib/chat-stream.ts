/**
 * Frontend-only streaming chat client.
 *
 * Contract with the Databricks FastAPI backend (to be implemented in VS Code):
 *
 *   POST {API_BASE}/chat/stream
 *   body: { messages: [{ role: "user" | "assistant", content: string }] }
 *   response: text/event-stream, one JSON object per `data:` line
 *
 * Event shapes:
 *   { "type": "text",  "delta": "..." }
 *   { "type": "tool",  "id": "t1", "name": "get_som_trend",
 *     "status": "running" | "done" | "error",
 *     "args": { ... }, "summary": "12 weeks, 444 prompts" }
 *   { "type": "chart", "chart": { kind, title, labels, datasets, footnote } }
 *   { "type": "error", "message": "..." }
 *   { "type": "done" }
 */

import { API_BASE, HAS_API_BACKEND } from "./api";

export type ChatRole = "user" | "assistant";

export type ToolStatus = "running" | "done" | "error";

export interface ToolCall {
  id: string;
  name: string;
  status: ToolStatus;
  args?: Record<string, unknown>;
  summary?: string;
}

export interface ChartDataset {
  label: string;
  data: (number | null)[];
  color?: string;
}

export interface ChartBlock {
  kind: "bar" | "line";
  title?: string;
  labels: string[];
  datasets: ChartDataset[];
  footnote?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  tools: ToolCall[];
  charts: ChartBlock[];
  error?: string;
  streaming?: boolean;
}

export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | ({ type: "tool" } & ToolCall)
  | { type: "chart"; chart: ChartBlock }
  | { type: "error"; message: string }
  | { type: "done" };

export interface StreamChatOptions {
  messages: { role: ChatRole; content: string }[];
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
}

/** Reads an SSE body and dispatches parsed JSON events. */
export async function streamChat({ messages, signal, onEvent }: StreamChatOptions) {
  if (!HAS_API_BACKEND) {
    throw new Error(
      "Ask Beacon needs the Databricks backend. This preview has no /chat/stream endpoint — run the app against your FastAPI host (or set VITE_API_BASE) to chat.",
    );
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new Error("Could not reach the chat backend.");
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!res.ok || !res.body || !contentType.includes("text/event-stream")) {
    throw new Error(
      res.status === 404 || !contentType.includes("text/event-stream")
        ? "Chat backend not available yet (POST /chat/stream)."
        : `Chat request failed: ${res.status} ${res.statusText}`,
    );
  }


  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          onEvent(JSON.parse(payload) as ChatStreamEvent);
        } catch {
          // Ignore malformed frames rather than killing the stream.
        }
      }
    }
  }
}
