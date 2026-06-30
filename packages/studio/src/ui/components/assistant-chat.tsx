import { ArrowUpIcon, Bot, Check, MessageCircleDashedIcon, MoreVertical, Square } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ChatMessageItem } from "@/components/chat-message-item";
import { AssistantSettingsDialog } from "@/components/assistant-settings-dialog";
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
  getProvider,
  loadAssistantConfig,
  saveAssistantConfig,
} from "@/lib/ai-providers";
import { streamChat } from "@/lib/chat-api";
import {
  type ChatMessage,
  createMessageMeta,
} from "@/lib/chat-message";

const LEGACY_API_KEY_STORAGE = "insyte.openrouter.apiKey";

export type { ChatMessage } from "@/lib/chat-message";

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

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function AssistantChat({ context }: AssistantChatProps) {
  const [config, setConfig] = useState<AssistantConfig>(() =>
    migrateLegacyConfig(loadAssistantConfig()),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  function handleCancel() {
    abortRef.current?.abort();
  }

  function removeEmptyAssistantMessage(assistantId: string) {
    setMessages((current) => {
      const assistant = current.find((message) => message.id === assistantId);
      if (assistant && !assistant.content.trim()) {
        return current.filter((message) => message.id !== assistantId);
      }
      return current;
    });
  }

  async function handleSend(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    if (!config.apiKey.trim()) {
      setError("Configure a provider and API key to start chatting.");
      setSettingsOpen(true);
      return;
    }

    if (!config.model.trim()) {
      setError("Choose a model before sending.");
      return;
    }

    const messageMeta = createMessageMeta(config.providerId, config.model);
    const assistantId = crypto.randomUUID();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      meta: messageMeta,
    };

    const nextMessages = [...messages, userMessage];
    setDraft("");
    setError(null);
    setSending(true);
    setStreamingMessageId(assistantId);
    setMessages([
      ...nextMessages,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        meta: messageMeta,
      },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat(config, nextMessages, context, {
        signal: controller.signal,
        onToken: (token) => {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, content: message.content + token }
                : message,
            ),
          );
        },
      });
      removeEmptyAssistantMessage(assistantId);
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) {
        removeEmptyAssistantMessage(assistantId);
        return;
      }

      removeEmptyAssistantMessage(assistantId);
      setError(err instanceof Error ? err.message : "Failed to reach the assistant.");
    } finally {
      setSending(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="size-4 shrink-0 text-primary" />
          <div className="text-sm font-semibold">Assistant</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 shrink-0">
              <MoreVertical className="size-4" />
              <span className="sr-only">Assistant settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Provider</DropdownMenuLabel>
            {Object.values(AI_PROVIDERS).map((item) => (
              <DropdownMenuItem
                key={item.id}
                className="flex w-full cursor-pointer items-center justify-between gap-3"
                onClick={() =>
                  item.id === config.providerId
                    ? setSettingsOpen(true)
                    : switchProvider(item.id)
                }
              >
                <span>{item.name}</span>
                {item.id === config.providerId ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setSettingsOpen(true)}
            >
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
                      scrollAnchor={message.role === "user" || message.id === streamingMessageId}
                    >
                      <ChatMessageItem
                        message={message}
                        isStreaming={message.id === streamingMessageId}
                      />
                    </MessageScrollerItem>
                  ))}
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
                  if (event.key === "Enter" && !event.shiftKey && !sending) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about your analytics…"
                rows={2}
              />
              <InputGroupAddon align="block-end" className="gap-1 pt-1">
                {provider.models.length > 0 ? (
                  <Select
                    value={config.model}
                    onValueChange={(value) => updateConfig({ ...config, model: value })}
                    disabled={sending}
                  >
                    <SelectTrigger className="h-8 w-[9.5rem] cursor-pointer border-border/50 bg-muted px-2 text-xs shadow-none hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring/30">
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
                    disabled={sending}
                    className="h-8 w-[9.5rem] rounded-lg border border-border/50 bg-muted px-2 text-xs outline-none placeholder:text-muted-foreground hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
                <InputGroupButton
                  type={sending ? "button" : "submit"}
                  variant="default"
                  size="icon-sm"
                  disabled={!sending && !draft.trim()}
                  className="ml-auto"
                  onClick={sending ? handleCancel : undefined}
                >
                  {sending ? <Square className="size-3.5 fill-current" /> : <ArrowUpIcon />}
                  <span className="sr-only">{sending ? "Stop generating" : "Send"}</span>
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
