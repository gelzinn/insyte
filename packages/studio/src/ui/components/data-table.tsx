import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCell } from "@/lib/utils";

interface DataTableProps {
  title: string;
  description?: string;
  rows: Record<string, unknown>[];
  columns: string[];
  selected: Record<string, unknown> | null;
  onSelect: (row: Record<string, unknown>) => void;
  emptyLabel?: string;
}

export function DataTable({
  title,
  description,
  rows,
  columns,
  selected,
  onSelect,
  emptyLabel,
}: DataTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No {emptyLabel ?? "records"} yet</CardTitle>
          <CardDescription>
            Send analytics from your app using the Insyte SDK. In development, events appear
            automatically when Studio is running.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="rounded-md bg-muted px-2 py-1 text-sm">
            analytics.track(&quot;button_clicked&quot;)
          </code>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden py-0">
      <CardHeader className="border-b py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          <span className="text-xs text-muted-foreground">{columns.length} fields</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={index}
                data-state={selected === row ? "selected" : undefined}
                className={cn("cursor-pointer", selected === row && "bg-muted")}
                onClick={() => onSelect(row)}
              >
                {columns.map((column) => (
                  <TableCell key={column} className="max-w-xs truncate">
                    {formatCell(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function EmptyOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No events yet</CardTitle>
        <CardDescription>
          Install the SDK, run your app, and events will appear here automatically in
          development.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-sm">
        <code className="rounded-md bg-muted px-2 py-1">bun add @insyte/track</code>
        <code className="rounded-md bg-muted px-2 py-1">npx insyte studio</code>
      </CardContent>
    </Card>
  );
}

export function RecordDetailPanel({
  record,
  onClose,
}: {
  record: Record<string, unknown>;
  onClose: () => void;
}) {
  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Record details</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
      <div className="space-y-4 overflow-auto p-4">
        {Object.entries(record).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {key}
            </div>
            <pre className="whitespace-pre-wrap break-all rounded-md bg-muted p-2 font-mono text-xs">
              {formatCell(value)}
            </pre>
          </div>
        ))}
      </div>
    </aside>
  );
}
