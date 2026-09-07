export default function SkeletonRows({ count = 6 }) {
  return (
    <div className="rounded-lg border border-border">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 border-b border-border px-4 py-3.5 last:border-b-0 sm:grid-cols-[160px_1fr_auto] sm:items-center sm:gap-4"
        >
          <div className="h-4 w-28 animate-pulse rounded bg-surface2" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-surface2" />
          <div className="h-5 w-24 animate-pulse rounded bg-surface2" />
        </div>
      ))}
    </div>
  );
}
