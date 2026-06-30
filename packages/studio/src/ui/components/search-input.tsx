import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search records...",
  className,
}: SearchInputProps) {
  return (
    <label
      className={cn(
        "flex h-9 min-w-0 items-center gap-2 rounded-lg border border-input bg-background px-3 transition-colors",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        className,
      )}
    >
      <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        type="text"
        role="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
