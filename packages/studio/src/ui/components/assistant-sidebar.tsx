"use client";

import * as React from "react";
import { PanelRightIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ASSISTANT_SIDEBAR_COOKIE = "assistant_sidebar_state";
const ASSISTANT_SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const ASSISTANT_SIDEBAR_WIDTH = "24rem";

type AssistantSidebarContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const AssistantSidebarContext = React.createContext<AssistantSidebarContextProps | null>(
  null,
);

export function useAssistantSidebar() {
  const context = React.useContext(AssistantSidebarContext);
  if (!context) {
    throw new Error("useAssistantSidebar must be used within AssistantSidebarProvider.");
  }
  return context;
}

export function AssistantSidebarProvider({
  defaultOpen = false,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [open, setOpen] = React.useState(defaultOpen);

  const setOpenState = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
    setOpen((current) => {
      const next = typeof value === "function" ? value(current) : value;
      document.cookie = `${ASSISTANT_SIDEBAR_COOKIE}=${next}; path=/; max-age=${ASSISTANT_SIDEBAR_COOKIE_MAX_AGE}`;
      return next;
    });
  }, []);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((current) => !current);
      return;
    }
    setOpenState((current) => !current);
  }, [isMobile, setOpenState]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "]" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const value = React.useMemo(
    () => ({
      open,
      setOpen: setOpenState,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [open, openMobile, isMobile, setOpenState, toggleSidebar],
  );

  return (
    <AssistantSidebarContext.Provider value={value}>
      <div
        data-slot="assistant-sidebar-wrapper"
        style={
          {
            "--assistant-sidebar-width": ASSISTANT_SIDEBAR_WIDTH,
            ...style,
          } as React.CSSProperties
        }
        className={cn("contents", className)}
        {...props}
      >
        {children}
      </div>
    </AssistantSidebarContext.Provider>
  );
}

export function AssistantSidebar({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, isMobile, openMobile, setOpenMobile } = useAssistantSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          side="right"
          data-slot="assistant-sidebar"
          className="w-(--assistant-sidebar-width) max-w-[90vw] bg-sidebar p-0 text-sidebar-foreground duration-300 [&>button]:hidden"
          style={
            {
              "--assistant-sidebar-width": ASSISTANT_SIDEBAR_WIDTH,
            } as React.CSSProperties
          }
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Assistant</SheetTitle>
            <SheetDescription>Analytics assistant sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <div
        data-slot="assistant-sidebar-gap"
        className={cn(
          "relative hidden shrink-0 bg-transparent transition-[width] duration-300 ease-in-out md:block",
          open ? "w-(--assistant-sidebar-width)" : "w-0",
        )}
      />
      <div
        data-slot="assistant-sidebar"
        data-state={open ? "expanded" : "collapsed"}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--assistant-sidebar-width) transition-[right,width] duration-300 ease-in-out md:flex",
          open ? "right-0" : "right-[calc(var(--assistant-sidebar-width)*-1)]",
          className,
        )}
        {...props}
      >
        <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
          {children}
        </div>
      </div>
    </>
  );
}

export function AssistantSidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useAssistantSidebar();

  return (
    <Button
      data-slot="assistant-sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      title="Toggle assistant (])"
      {...props}
    >
      <PanelRightIcon />
      <span className="sr-only">Toggle Assistant</span>
    </Button>
  );
}
