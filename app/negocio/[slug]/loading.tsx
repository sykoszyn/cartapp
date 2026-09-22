function Bar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-100 ${className ?? ""}`} />;
}

export default function BusinessLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-ink-800/10">
        <div className="container-prose flex h-20 items-center">
          <Bar className="h-6 w-32" />
        </div>
      </div>
      <div className="container-prose space-y-6 py-10">
        <Bar className="h-40 w-full" />
        <Bar className="h-6 w-2/3" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bar key={i} className="h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}
