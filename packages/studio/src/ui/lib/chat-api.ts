import type { AssistantConfig } from "@/lib/ai-providers";
import type { ChatMessage } from "@/lib/chat-message";

type StreamEvent =
  | { type: "token"; content: string }
  | { type: "done"; model: string }
  | { type: "error"; error: string };

interface StreamChatOptions {
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

function parseStreamEventBlock(block: string): StreamEvent | null {
  for (const line of block.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;

    const payload = trimmed.slice(5).trim();
    if (!payload) continue;

    try {
      return JSON.parse(payload) as StreamEvent;
    } catch {
      continue;
    }
  }

  return null;
}

export async function streamChat(
  config: AssistantConfig,
  messages: ChatMessage[],
  context: string,
  { signal, onToken }: StreamChatOptions,
): Promise<void> {
  const response = await fetch("/api/ai/chat/stream", {
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
    signal,
  });

  if (!response.ok && !response.body) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Chat request failed.");
  }

  if (!response.body) {
    throw new Error("The assistant returned an empty stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const eventEnd = buffer.indexOf("\n\n");
      if (eventEnd === -1) break;

      const block = buffer.slice(0, eventEnd);
      buffer = buffer.slice(eventEnd + 2);
      const event = parseStreamEventBlock(block);
      if (!event) continue;

      if (event.type === "token") {
        onToken(event.content);
      } else if (event.type === "error") {
        throw new Error(event.error);
      }
    }
  }
}
