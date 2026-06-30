import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div
      className={cn(
        "markdown-message space-y-2 text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc space-y-1 pl-4 marker:text-muted-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal space-y-1 pl-4 marker:text-muted-foreground">{children}</ol>
        ),
        li: ({ children }) => <li className="pl-0.5">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        code: ({ className: codeClassName, children, ...props }) => {
          const isBlock = codeClassName?.includes("language-");
          if (isBlock) {
            return (
              <code
                className={cn(
                  "block overflow-x-auto rounded-md bg-background/40 px-3 py-2 font-mono text-xs leading-relaxed",
                  codeClassName,
                )}
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className="rounded bg-background/40 px-1 py-0.5 font-mono text-[0.85em]"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="overflow-x-auto rounded-md bg-background/40 p-0">{children}</pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-current/20 pl-3 text-muted-foreground">
            {children}
          </blockquote>
        ),
        h1: ({ children }) => <h1 className="text-base font-semibold">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-medium">{children}</h3>,
        hr: () => <hr className="border-current/15" />,
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-current/15 px-2 py-1 text-left font-medium">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-current/15 px-2 py-1 align-top">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
