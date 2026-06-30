import { ArrowUpIcon, Bot, KeyRound, MessageCircleDashedIcon } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";

const API_KEY_STORAGE = "insyte.openrouter.apiKey";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AssistantChatProps {
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

export function AssistantChat({ context }: AssistantChatProps) {
  const [apiKey, setApiKey] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) setApiKey(stored);
  }, []);

  function saveApiKey(value: string) {
    setApiKey(value);
    if (value.trim()) {
      localStorage.setItem(API_KEY_STORAGE, value.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  }

  async function handleSend(event?: FormEvent) {
    event?.preventDefault();
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

    const nextMessages = [...messages, userMessage];
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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Assistant</h3>
            <p className="text-[11px] text-muted-foreground">OpenRouter · free models</p>
          </div>
        </div>
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
          . Uses <code className="rounded bg-muted px-1">openrouter/free</code>.
        </p>
      </div>

      {error ? (
        <div className="mx-4 mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <MessageScrollerProvider>
        <div className="flex min-h-0 flex-1 flex-col">
          {messages.length === 0 && !sending ? (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageCircleDashedIcon />
                </EmptyMedia>
                <EmptyTitle>Ask about your analytics</EmptyTitle>
                <EmptyDescription>
                  Page views, events, traffic sources, or what to explore next in the
                  studio.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <MessageScroller autoScroll className="min-h-0 flex-1">
              <MessageScrollerViewport>
                <MessageScrollerContent className="gap-6 p-4">
                  {messages.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      scrollAnchor={message.role === "user"}
                    >
                      <Message align={message.role === "user" ? "end" : "start"}>
                        <MessageContent>
                          <Bubble
                            variant={message.role === "user" ? "default" : "muted"}
                            align={message.role === "user" ? "end" : "start"}
                          >
                            <BubbleContent>{message.content}</BubbleContent>
                          </Bubble>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                  {sending ? (
                    <MessageScrollerItem>
                      <Marker>
                        <MarkerContent>
                          <span className="shimmer text-sm text-muted-foreground">
                            Thinking…
                          </span>
                        </MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  ) : null}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton />
            </MessageScroller>
          )}

          <form onSubmit={(event) => void handleSend(event)} className="border-t p-4">
            <InputGroup>
              <InputGroupTextarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about your analytics…"
                rows={2}
                disabled={sending}
              />
              <InputGroupAddon align="block-end" className="pt-1">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  size="icon-sm"
                  disabled={sending || !draft.trim()}
                  className="ml-auto"
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </div>
      </MessageScrollerProvider>
    </div>
  );
}
