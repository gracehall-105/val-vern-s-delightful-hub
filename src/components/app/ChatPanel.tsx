import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertTriangle,
  ArrowUp,
  Check,
  Loader2,
  MessageSquare,
  Square,
  Wrench,
  X,
} from "lucide-react";
import { ChatChart } from "@/components/app/ChatChart";
import {
  streamChat,
  type ChatMessage,
  type ChatStreamEvent,
  type ToolCall,
} from "@/lib/chat-stream";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Why did Voya's share drop in June?",
  "Which channels cite competitors but not Voya?",
  "Show Share of Model trend for the last 10 weeks",
];

const TOOL_LABELS: Record<string, string> = {
  get_som_trend: "Share of Model trend",
  get_som_shares: "Company shares",
  get_sources: "Citation sources",
  get_prompts: "Prompt library",
  get_recommendations: "Recommendations",
};

function newId() {
  return Math.random().toString(36).slice(2);
}

function ToolChip({ tool }: { tool: ToolCall }) {
  const label = TOOL_LABELS[tool.name] ?? tool.name;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        tool.status === "running" && "border-voya-orange/30 bg-voya-orange/10 text-voya-orange",
        tool.status === "done" && "border-border bg-secondary text-foreground/70",
        tool.status === "error" && "border-red-500/30 bg-red-500/10 text-red-600",
      )}
      title={tool.args ? JSON.stringify(tool.args) : undefined}
    >
      {tool.status === "running" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : tool.status === "error" ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Check className="h-3 w-3" />
      )}
      {label}
      {tool.summary && <span className="text-muted-foreground">· {tool.summary}</span>}
    </span>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-voya-orange px-3.5 py-2 text-sm leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {message.tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {message.tools.map((t) => (
            <ToolChip key={t.id} tool={t} />
          ))}
        </div>
      )}

      {message.content && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-foreground [&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_li]:my-0.5 [&_p]:my-2 [&_table]:text-xs">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
      )}

      {message.charts.map((chart, i) => (
        <ChatChart key={i} block={chart} />
      ))}

      {message.streaming && !message.content && message.tools.length === 0 && (
        <p className="animate-pulse text-sm text-muted-foreground">Thinking…</p>
      )}

      {message.error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {message.error}
        </p>
      )}
    </div>
  );
}

export function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const history = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages],
  );

  function patchAssistant(id: string, fn: (m: ChatMessage) => ChatMessage) {
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: newId(),
      role: "user",
      content: trimmed,
      tools: [],
      charts: [],
    };
    const assistantId = newId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      tools: [],
      charts: [],
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const handleEvent = (event: ChatStreamEvent) => {
      patchAssistant(assistantId, (m) => {
        switch (event.type) {
          case "text":
            return { ...m, content: m.content + event.delta };
          case "tool": {
            const { type: _t, ...tool } = event;
            const exists = m.tools.some((x) => x.id === tool.id);
            return {
              ...m,
              tools: exists
                ? m.tools.map((x) => (x.id === tool.id ? { ...x, ...tool } : x))
                : [...m.tools, tool],
            };
          }
          case "chart":
            return { ...m, charts: [...m.charts, event.chart] };
          case "error":
            return { ...m, error: event.message };
          default:
            return m;
        }
      });
    };

    try {
      await streamChat({
        messages: [...history, { role: "user", content: trimmed }],
        signal: controller.signal,
        onEvent: handleEvent,
      });
    } catch (err) {
      if (!controller.signal.aborted) {
        patchAssistant(assistantId, (m) => ({
          ...m,
          error: err instanceof Error ? err.message : "Something went wrong.",
        }));
      }
    } finally {
      patchAssistant(assistantId, (m) => ({
        ...m,
        streaming: false,
        content: controller.signal.aborted ? `${m.content}\n\n_Stopped._` : m.content,
      }));
      abortRef.current = null;
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity md:bg-black/20",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 md:h-20">
          <MessageSquare className="h-4 w-4 text-voya-orange" />
          <div>
            <h2 className="font-display text-base leading-none">Ask Beacon</h2>
            <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              Grounded in your prompt data
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="space-y-3 pt-6">
              <p className="text-sm text-muted-foreground">
                Ask about Share of Model, citation sources, competitors, or content gaps. Beacon
                queries your tracked prompt data and explains what it finds.
              </p>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-left text-xs text-foreground/80 transition-colors hover:border-voya-orange/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="shrink-0 border-t border-border p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 focus-within:border-voya-orange/50">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask about your AI visibility…"
              className="max-h-32 flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type={busy ? "button" : "submit"}
              onClick={busy ? () => abortRef.current?.abort() : undefined}
              disabled={!busy && !input.trim()}
              aria-label={busy ? "Stop" : "Send"}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-voya-orange text-white transition-opacity disabled:opacity-30"
            >
              {busy ? <Square className="h-3.5 w-3.5" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 flex items-center gap-1 px-1 text-[10px] text-muted-foreground">
            <Wrench className="h-2.5 w-2.5" />
            Answers are generated from tracked prompt data — verify before external use.
          </p>
        </form>
      </aside>
    </>
  );
}
