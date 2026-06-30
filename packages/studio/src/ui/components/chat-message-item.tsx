import { Info, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { MarkdownMessage } from "@/components/markdown-message";
import { ProviderMessageIcon } from "@/components/provider-message-icon";
import { UserMessageAvatar } from "@/components/user-message-avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message, MessageContent } from "@/components/ui/message";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { type ChatMessage, getMessageDisplayName } from "@/lib/chat-message";
import { cn } from "@/lib/utils";

interface ChatMessageItemProps {
  message: ChatMessage;
}

function MessageInfoDialog({
  message,
  open,
  onOpenChange,
}: {
  message: ChatMessage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isUser = message.role === "user";
  const provider = message.meta ? AI_PROVIDERS[message.meta.providerId] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Message info</DialogTitle>
          <DialogDescription>
            {isUser ? "Details for your message." : "Details for this assistant reply."}
          </DialogDescription>
        </DialogHeader>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Sender</dt>
            <dd className="font-medium">{getMessageDisplayName(message)}</dd>
          </div>
          {message.meta ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Provider</dt>
                <dd className="font-medium">{provider?.name ?? message.meta.providerId}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Model</dt>
                <dd className="text-right font-medium">{message.meta.modelLabel}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="shrink-0 text-muted-foreground">Model ID</dt>
                <dd className="break-all text-right font-mono text-xs">{message.meta.model}</dd>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No provider metadata was stored for this message.</p>
          )}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const isUser = message.role === "user";
  const displayName = getMessageDisplayName(message);

  const avatar = isUser ? (
    <UserMessageAvatar />
  ) : message.meta ? (
    <ProviderMessageIcon providerId={message.meta.providerId} />
  ) : (
    <ProviderMessageIcon providerId="custom" />
  );

  return (
    <>
      <Message align={isUser ? "end" : "start"} className="items-start gap-2.5">
        <div className="flex shrink-0 self-start">{avatar}</div>

        <MessageContent className="max-w-[85%] gap-1.5">
          <span
            className={cn(
              "pt-1 pb-2 text-xs leading-none font-medium text-muted-foreground",
              isUser ? "self-end" : "self-start",
            )}
          >
            {displayName}
          </span>

          <div
            className={cn(
              "flex w-full min-w-0",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <Bubble
              variant={isUser ? "default" : "muted"}
              align={isUser ? "end" : "start"}
              className="group/bubble-row max-w-full"
            >
              <BubbleContent className="relative">
                {!isUser ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  message.content
                )}

                <div
                  className={cn(
                    "absolute top-0 z-10 opacity-0 transition-opacity group-hover/bubble-row:opacity-100 has-[[data-state=open]]:opacity-100",
                    isUser ? "left-0" : "right-0",
                  )}
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute top-0 h-9 w-12",
                      isUser
                        ? "left-0 rounded-tl-xl bg-gradient-to-r from-primary via-primary/90 to-transparent"
                        : "right-0 rounded-tr-xl bg-gradient-to-l from-muted via-muted/90 to-transparent",
                    )}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className={cn(
                          "relative z-[1] size-7 cursor-pointer",
                          isUser
                            ? "rounded-tl-xl text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                            : "rounded-tr-xl hover:bg-foreground/5",
                        )}
                        aria-label="Message actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align={isUser ? "start" : "end"}
                      side="bottom"
                      sideOffset={6}
                      alignOffset={0}
                      collisionPadding={0}
                      avoidCollisions={false}
                      className="w-44"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setInfoOpen(true)}
                      >
                        <Info className="size-4" />
                        Message info
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </BubbleContent>
            </Bubble>
          </div>
        </MessageContent>
      </Message>

      <MessageInfoDialog message={message} open={infoOpen} onOpenChange={setInfoOpen} />
    </>
  );
}
