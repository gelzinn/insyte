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
import { Message, MessageAvatar, MessageContent, MessageHeader } from "@/components/ui/message";
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

  return (
    <>
      <Message align={isUser ? "end" : "start"} className="items-start">
        <MessageAvatar className="self-start bg-transparent p-0">
          {isUser ? (
            <UserMessageAvatar />
          ) : message.meta ? (
            <ProviderMessageIcon providerId={message.meta.providerId} />
          ) : (
            <ProviderMessageIcon providerId="custom" />
          )}
        </MessageAvatar>

        <MessageContent className="max-w-[85%]">
          <MessageHeader
            className={cn(
              "px-0 pb-1",
              isUser ? "justify-end text-right" : "justify-start text-left",
            )}
          >
            {displayName}
          </MessageHeader>

          <div
            className={cn(
              "group/bubble-row relative flex w-full min-w-0",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <Bubble
              variant={isUser ? "default" : "muted"}
              align={isUser ? "end" : "start"}
              className="max-w-full"
            >
              <BubbleContent>
                {!isUser ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  message.content
                )}
              </BubbleContent>
            </Bubble>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className={cn(
                    "absolute top-1/2 size-7 -translate-y-1/2 cursor-pointer opacity-0 transition-opacity group-hover/bubble-row:opacity-100 focus-visible:opacity-100",
                    isUser ? "-left-9" : "-right-9",
                  )}
                  aria-label="Message actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isUser ? "end" : "start"} className="w-44">
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
        </MessageContent>
      </Message>

      <MessageInfoDialog message={message} open={infoOpen} onOpenChange={setInfoOpen} />
    </>
  );
}
