export class InsyteError extends Error {
  readonly code: string;
  readonly hint?: string;

  constructor(code: string, message: string, hint?: string) {
    super(message);
    this.name = "InsyteError";
    this.code = code;
    this.hint = hint;
  }
}

export function missingStudioHint(studioUrl: string): string {
  return `Studio unreachable at ${studioUrl}. Run: npx insyte studio`;
}

export function notInitializedHint(): string {
  return "Call await analytics.init() first, or use InsyteProvider with autoInit";
}

export function formatInsyteError(error: unknown): string {
  if (error instanceof InsyteError) {
    return error.hint ? `${error.message}\n  → ${error.hint}` : error.message;
  }

  return error instanceof Error ? error.message : String(error);
}

export function logInsyteError(scope: string, error: unknown): void {
  console.error(`[@insyte/${scope}] ${formatInsyteError(error)}`);
}
