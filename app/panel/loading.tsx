function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-100 ${className ?? ""}`} />;
}

export default function PanelLoading() {
  return (
    <div className="space-y-6">
      <Bar className="h-7 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}
