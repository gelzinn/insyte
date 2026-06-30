import { ArrowUpIcon, Bot, MessageCircleDashedIcon, MoreVertical } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { MarkdownMessage } from "@/components/markdown-message";
import { AssistantSettingsDialog } from "@/components/assistant-settings-dialog";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AI_PROVIDERS,
  type AssistantConfig,
  type ProviderId,
  getModelLabel,
  getProvider,
  loadAssistantConfig,
  saveAssistantConfig,
} from "@/lib/ai-providers";

const LEGACY_API_KEY_STORAGE = "insyte.openrouter.apiKey";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AssistantChatProps {
  context: string;
}

function migrateLegacyConfig(config: AssistantConfig): AssistantConfig {
  if (config.apiKey) return config;
  const legacy = localStorage.getItem(LEGACY_API_KEY_STORAGE);
  if (!legacy) return config;
  const next = { ...config, apiKey: legacy };
  saveAssistantConfig(next);
  localStorage.removeItem(LEGACY_API_KEY_STORAGE);
  return next;
}

async function postChat(
  config: AssistantConfig,
  messages: ChatMessage[],
  context: string,
): Promise<string> {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      providerId: config.providerId,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
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
  const [config, setConfig] = useState<AssistantConfig>(() =>
    migrateLegacyConfig(loadAssistantConfig()),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = getProvider(config);

  useEffect(() => {
    setConfig(migrateLegacyConfig(loadAssistantConfig()));
  }, []);

  function updateConfig(next: AssistantConfig) {
    saveAssistantConfig(next);
    setConfig(next);
  }

  function switchProvider(providerId: ProviderId) {
    const nextProvider = AI_PROVIDERS[providerId];
    updateConfig({
      providerId,
      apiKey: config.apiKey,
      baseUrl: nextProvider.defaultBaseUrl,
      model: nextProvider.defaultModel,
    });
    setSettingsOpen(true);
  }

  async function handleSend(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    if (!config.apiKey.trim() && config.providerId !== "grok-inc") {
      setError("Configure a provider and API key to start chatting.");
      setSettingsOpen(true);
      return;
    }

    if (!config.model.trim()) {
      setError("Choose a model before sending.");
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
      const reply = await postChat(config, nextMessages, context);
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
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <div className="text-sm font-semibold">Assistant</div>
            <div className="truncate text-xs text-muted-foreground">
              {getModelLabel(config)}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
              <MoreVertical className="size-4" />
              <span className="sr-only">Assistant settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Provider</DropdownMenuLabel>
            {Object.values(AI_PROVIDERS).map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() =>
                  item.id === config.providerId
                    ? setSettingsOpen(true)
                    : switchProvider(item.id)
                }
              >
                {item.name}
                {item.id === config.providerId ? " · active" : ""}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
              Configure provider…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error ? (
        <div className="mx-4 mb-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
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
                            <BubbleContent>
                              {message.role === "assistant" ? (
                                <MarkdownMessage content={message.content} />
                              ) : (
                                message.content
                              )}
                            </BubbleContent>
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

          <form onSubmit={(event) => void handleSend(event)} className="p-4 pt-0">
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
              <InputGroupAddon align="block-end" className="gap-1 pt-1">
                {provider.models.length > 0 ? (
                  <Select
                    value={config.model}
                    onValueChange={(value) => updateConfig({ ...config, model: value })}
                  >
                    <SelectTrigger className="h-8 w-[9.5rem] border-0 bg-transparent px-2 text-xs shadow-none focus:ring-0">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    value={config.model}
                    onChange={(event) =>
                      updateConfig({ ...config, model: event.target.value })
                    }
                    placeholder="Model ID"
                    className="h-8 w-[9.5rem] bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground"
                  />
                )}
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

      <AssistantSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        config={config}
        onSave={updateConfig}
      />
    </div>
  );
}
