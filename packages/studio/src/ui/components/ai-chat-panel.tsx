import { Bot, KeyRound, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const API_KEY_STORAGE = "insyte.openrouter.apiKey";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiChatPanelProps {
  open: boolean;
  onClose: () => void;
  context: string;
}

async function postChat(
  apiKey: string,
  messages: ChatMessage[],
  context: string,
): Promise<string> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      messages: messages.map(({ role, content }) => ({ role, content })),
      context,
    }),
  });

  const payload = (await response.json()) as { error?: string; message?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Chat request failed.");
  }

  if (!payload.message) {
    throw new Error("Assistant returned an empty response.");
  }

  return payload.message;
}

export function AiChatPanel({ open, onClose, context }: AiChatPanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask me about your analytics — page views, events, traffic sources, or what to explore next.",
    },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) setApiKey(stored);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function saveApiKey(value: string) {
    setApiKey(value);
    if (value.trim()) {
      localStorage.setItem(API_KEY_STORAGE, value.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || sending) return;

    if (!apiKey.trim()) {
      setError("Add your OpenRouter API key to start chatting.");
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const nextMessages = [...messages.filter((message) => message.id !== "welcome"), userMessage];
    setDraft("");
    setError(null);
    setSending(true);
    setMessages(nextMessages);

    try {
      const reply = await postChat(apiKey, nextMessages, context);
      setMessages([
        ...nextMessages,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reach the assistant.");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l border-border bg-card transition-[width,opacity] duration-300 ease-in-out">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Assistant</h3>
            <p className="text-[11px] text-muted-foreground">OpenRouter · free models</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close assistant">
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-2 border-b px-4 py-3">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <KeyRound className="size-3.5" />
          OpenRouter API key
        </label>
        <Input
          type="password"
          placeholder="sk-or-..."
          value={apiKey}
          onChange={(event) => saveApiKey(event.target.value)}
          className="h-8"
        />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Get a free key at{" "}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline-offset-2 hover:underline"
          >
            openrouter.ai/keys
          </a>
          . Uses the <code className="rounded bg-muted px-1">openrouter/free</code> model router.
        </p>
      </div>

      {error ? (
        <div className="mx-4 mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <ScrollArea className="min-h-0 flex-1 px-4 py-3">
        <div className="space-y-3 pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {message.content}
            </div>
          ))}
          {sending ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Thinking…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="Ask about your analytics…"
            rows={3}
            className="min-h-[72px] flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <Button size="icon" onClick={() => void handleSend()} disabled={sending || !draft.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Enter to send · Shift+Enter for newline</p>
      </div>
    </aside>
  );
}
