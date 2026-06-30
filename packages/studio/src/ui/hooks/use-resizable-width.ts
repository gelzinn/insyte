import { useCallback, useEffect, useState } from "react";

function readStoredWidth(storageKey: string, defaultWidth: number, minWidth: number) {
  if (typeof window === "undefined") return defaultWidth;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultWidth;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return defaultWidth;
    return Math.max(minWidth, parsed);
  } catch {
    return defaultWidth;
  }
}

export function useResizableWidth(
  storageKey: string,
  defaultWidth: number,
  minWidth: number,
  maxWidth: number,
) {
  const [width, setWidthState] = useState(() =>
    readStoredWidth(storageKey, defaultWidth, minWidth),
  );

  const setWidth = useCallback(
    (next: number) => {
      const clamped = Math.min(maxWidth, Math.max(minWidth, Math.round(next)));
      setWidthState(clamped);
      localStorage.setItem(storageKey, String(clamped));
    },
    [maxWidth, minWidth, storageKey],
  );

  useEffect(() => {
    setWidthState(readStoredWidth(storageKey, defaultWidth, minWidth));
  }, [defaultWidth, minWidth, storageKey]);

  return { width, setWidth, minWidth, maxWidth };
}

export function startWidthDrag(options: {
  side: "left" | "right";
  startX: number;
  startWidth: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
}) {
  const { side, startX, startWidth, minWidth, maxWidth, onWidthChange } = options;

  const handleMove = (event: PointerEvent) => {
    const delta = side === "left" ? event.clientX - startX : startX - event.clientX;
    onWidthChange(Math.min(maxWidth, Math.max(minWidth, startWidth + delta)));
  };

  const handleUp = () => {
    window.removeEventListener("pointermove", handleMove);
    window.removeEventListener("pointerup", handleUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  window.addEventListener("pointermove", handleMove);
  window.addEventListener("pointerup", handleUp);
}
