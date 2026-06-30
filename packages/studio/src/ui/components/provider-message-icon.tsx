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
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
          className,
        )}
      >
        <Bot className="size-4" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted p-1.5",
        className,
      )}
    >
      <img
        src={iconUrl}
        alt=""
        aria-hidden="true"
        className="size-full object-contain"
        onError={() => setFailed(true)}
        title={providerName}
      />
    </div>
  );
}
