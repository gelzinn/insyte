import { Bot } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  AI_PROVIDERS,
  type ProviderId,
  getProviderIconUrl,
} from "@/lib/ai-providers";

interface ProviderMessageIconProps {
  providerId: ProviderId;
  className?: string;
}

export function ProviderMessageIcon({ providerId, className }: ProviderMessageIconProps) {
  const [failed, setFailed] = useState(false);
  const iconUrl = getProviderIconUrl(providerId);
  const providerName = AI_PROVIDERS[providerId]?.name ?? providerId;

  if (!iconUrl || failed) {
    return (
      <Bot
        className={cn("size-5 shrink-0 text-muted-foreground", className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      className={cn("size-5 shrink-0 object-contain", className)}
      onError={() => setFailed(true)}
      title={providerName}
    />
  );
}
