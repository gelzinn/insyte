export type ProviderId = "openrouter" | "grok" | "custom";

export interface ProviderModel {
  id: string;
  label: string;
}

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  description: string;
  docsUrl: string;
  defaultBaseUrl: string;
  defaultModel: string;
  models: ProviderModel[];
  setupSteps: string[];
  apiKeyPlaceholder: string;
}

export const AI_PROVIDERS: Record<ProviderId, ProviderDefinition> = {
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    description: "Route requests across many models, including free options.",
    docsUrl: "https://openrouter.ai/docs",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openrouter/free",
    apiKeyPlaceholder: "sk-or-...",
    models: [
      { id: "openrouter/free", label: "Free router" },
      { id: "google/gemma-2-9b-it:free", label: "Gemma 2 9B (free)" },
      { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (free)" },
    ],
    setupSteps: [
      "Open openrouter.ai and create an account.",
      "Go to Keys and create a new API key.",
      "Paste the key below and pick a model (Free router is a good default).",
      "Send a message in the assistant to verify the connection.",
    ],
  },
  grok: {
    id: "grok",
    name: "Grok",
    description: "xAI models via api.x.ai (consumer chat lives at grok.com).",
    docsUrl: "https://docs.x.ai/docs",
    defaultBaseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-4-fast-non-reasoning",
    apiKeyPlaceholder: "xai-...",
    models: [
      { id: "grok-4-fast-non-reasoning", label: "Grok 4 Fast" },
      { id: "grok-3-mini", label: "Grok 3 Mini" },
      { id: "grok-3", label: "Grok 3" },
    ],
    setupSteps: [
      "Open console.x.ai (developer console, separate from the grok.com chat UI).",
      "Create a team or use your personal workspace.",
      "Generate an API key with chat completion access.",
      "New accounts may receive promotional credits — add billing only if you need more.",
      "Paste the key below, keep the default api.x.ai base URL, and choose a model.",
    ],
  },
  custom: {
    id: "custom",
    name: "Custom",
    description: "Any OpenAI-compatible endpoint and model ID.",
    docsUrl: "https://github.com/openai/openai-openapi",
    defaultBaseUrl: "",
    defaultModel: "",
    apiKeyPlaceholder: "your-api-key",
    models: [],
    setupSteps: [
      "Find your provider's OpenAI-compatible base URL (usually ends with /v1).",
      "Create or copy an API key from that provider's dashboard.",
      "Enter the base URL, API key, and the exact model ID your provider expects.",
      "Send a test message — Insyte forwards requests without storing your key on the server.",
    ],
  },
};

export interface AssistantConfig {
  providerId: ProviderId;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export const ASSISTANT_CONFIG_STORAGE = "insyte.assistant.config";

export function defaultAssistantConfig(): AssistantConfig {
  const provider = AI_PROVIDERS.openrouter;
  return {
    providerId: provider.id,
    apiKey: "",
    baseUrl: provider.defaultBaseUrl,
    model: provider.defaultModel,
  };
}

export function loadAssistantConfig(): AssistantConfig {
  if (typeof window === "undefined") return defaultAssistantConfig();

  try {
    const raw = localStorage.getItem(ASSISTANT_CONFIG_STORAGE);
    if (!raw) return defaultAssistantConfig();
    const parsed = JSON.parse(raw) as Partial<AssistantConfig>;
    const providerId = parsed.providerId ?? "openrouter";
    const provider = AI_PROVIDERS[providerId] ?? AI_PROVIDERS.openrouter;
    return {
      providerId: provider.id,
      apiKey: parsed.apiKey ?? "",
      baseUrl: parsed.baseUrl?.trim() || provider.defaultBaseUrl,
      model: parsed.model?.trim() || provider.defaultModel,
    };
  } catch {
    return defaultAssistantConfig();
  }
}

export function saveAssistantConfig(config: AssistantConfig) {
  localStorage.setItem(ASSISTANT_CONFIG_STORAGE, JSON.stringify(config));
}

export function getProvider(config: AssistantConfig): ProviderDefinition {
  return AI_PROVIDERS[config.providerId] ?? AI_PROVIDERS.openrouter;
}

export function getModelLabel(config: AssistantConfig): string {
  const provider = getProvider(config);
  const match = provider.models.find((model) => model.id === config.model);
  if (match) return match.label;
  return config.model || provider.defaultModel || "No model";
}
