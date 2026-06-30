import { ProviderMessageIcon } from "@/components/provider-message-icon";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { type ChatMessageMeta } from "@/lib/chat-message";

interface ChatMessageThinkingItemProps {
  meta: ChatMessageMeta;
}

export function ChatMessageThinkingItem({ meta }: ChatMessageThinkingItemProps) {
  const displayName = AI_PROVIDERS[meta.providerId]?.name ?? meta.providerId;

  return (
    <Message align="start" className="items-start gap-2.5" aria-busy="true" aria-live="polite">
      <div className="flex shrink-0 self-start">
        <ProviderMessageIcon providerId={meta.providerId} />
      </div>

      <MessageContent className="max-w-[85%] gap-1.5">
        <span className="self-start pt-1 pb-2 text-xs leading-none font-medium text-muted-foreground">
          {displayName}
        </span>

        <div className="flex w-full min-w-0 justify-start">
          <Bubble variant="muted" align="start" className="max-w-full">
            <BubbleContent>
              <span className="shimmer text-sm text-muted-foreground">Thinking…</span>
            </BubbleContent>
          </Bubble>
        </div>
      </MessageContent>
    </Message>
  );
}
