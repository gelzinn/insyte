import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options?: { modifiers?: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean } },
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key !== key) return;

      const modifiers = options?.modifiers;
      if (modifiers?.meta && !event.metaKey) return;
      if (modifiers?.ctrl && !event.ctrlKey) return;
      if (modifiers?.shift && !event.shiftKey) return;
      if (modifiers?.alt && !event.altKey) return;

      if (!modifiers?.meta && !modifiers?.ctrl && (event.metaKey || event.ctrlKey || event.altKey)) {
        return;
      }

      event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handler, key, options?.modifiers]);
}
