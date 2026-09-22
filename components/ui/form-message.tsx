export function FormMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) return null;
  return (
    <div
      className={
        error
          ? "rounded border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-600"
          : "rounded border border-olive-500/30 bg-olive-100 px-4 py-3 text-sm text-olive-600"
      }
    >
      {error || success}
    </div>
  );
}
