import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  saveAssistantConfig,
} from "@/lib/ai-providers";

interface AssistantSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: AssistantConfig;
  onSave: (config: AssistantConfig) => void;
}

export function AssistantSettingsDialog({
  open,
  onOpenChange,
  config,
  onSave,
}: AssistantSettingsDialogProps) {
  const [draft, setDraft] = useState(config);

  useEffect(() => {
    if (open) setDraft(config);
  }, [config, open]);

  const provider = getProvider(draft);

  function setProviderId(providerId: ProviderId) {
    const next = AI_PROVIDERS[providerId];
    setDraft({
      providerId,
      apiKey: draft.apiKey,
      baseUrl: next.defaultBaseUrl,
      model: next.defaultModel,
    });
  }

  function handleSave() {
    const next = {
      ...draft,
      baseUrl: draft.baseUrl.trim() || provider.defaultBaseUrl,
      model: draft.model.trim() || provider.defaultModel,
    };
    saveAssistantConfig(next);
    onSave(next);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assistant provider</DialogTitle>
          <DialogDescription>{provider.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Provider</label>
            <Select value={draft.providerId} onValueChange={(value) => setProviderId(value as ProviderId)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AI_PROVIDERS).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground">
            {provider.setupSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">API key</label>
            <Input
              type="password"
              placeholder={provider.apiKeyPlaceholder}
              value={draft.apiKey}
              onChange={(event) => setDraft({ ...draft, apiKey: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Base URL</label>
            <Input
              placeholder={provider.defaultBaseUrl || "https://your-provider.com/v1"}
              value={draft.baseUrl}
              onChange={(event) => setDraft({ ...draft, baseUrl: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Default model</label>
            {provider.models.length > 0 ? (
              <Select
                value={draft.model}
                onValueChange={(value) => setDraft({ ...draft, model: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
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
              <Input
                placeholder="model-id"
                value={draft.model}
                onChange={(event) => setDraft({ ...draft, model: event.target.value })}
              />
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            Docs:{" "}
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline-offset-2 hover:underline"
            >
              {provider.docsUrl.replace(/^https?:\/\//, "")}
            </a>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
