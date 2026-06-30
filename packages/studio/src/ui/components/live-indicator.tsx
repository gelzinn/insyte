export function LiveIndicator() {
  return (
    <span className="relative flex size-2.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
      <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
    </span>
  );
}
