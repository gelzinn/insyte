import type { PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import { startWidthDrag } from "@/hooks/use-resizable-width";

interface SidebarResizeRailProps {
  side: "left" | "right";
  width: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
  className?: string;
}

export function SidebarResizeRail({
  side,
  width,
  minWidth,
  maxWidth,
  onWidthChange,
  className,
}: SidebarResizeRailProps) {
  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();

    startWidthDrag({
      side,
      startX: event.clientX,
      startWidth: width,
      minWidth,
      maxWidth,
      onWidthChange,
    });
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={width}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      title="Drag to resize sidebar"
      onPointerDown={handlePointerDown}
      className={cn(
        "absolute inset-y-0 z-30 w-1.5 touch-none select-none",
        "after:absolute after:inset-y-0 after:w-px after:bg-transparent after:transition-colors hover:after:bg-sidebar-border",
        side === "left" ? "right-0 translate-x-1/2 cursor-col-resize" : "left-0 -translate-x-1/2 cursor-col-resize",
        className,
      )}
    />
  );
}
