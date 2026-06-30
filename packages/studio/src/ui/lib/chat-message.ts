import {
  type ProviderId,
  getModelLabelForProvider,
  getProvider,
} from "@/lib/ai-providers";

export interface ChatMessageMeta {
  providerId: ProviderId;
  model: string;
  modelLabel: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: ChatMessageMeta;
}

export function createMessageMeta(
  providerId: ProviderId,
  model: string,
): ChatMessageMeta {
  return {
    providerId,
    model,
    modelLabel: getModelLabelForProvider(providerId, model),
  };
}

export function getMessageDisplayName(message: ChatMessage): string {
  if (message.role === "user") return "You";
  if (!message.meta) return "Assistant";
  return getProvider({ providerId: message.meta.providerId, apiKey: "", baseUrl: "", model: message.meta.model }).name;
}
