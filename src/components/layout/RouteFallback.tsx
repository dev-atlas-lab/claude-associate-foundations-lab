export function RouteFallback() {
  return (
    <div className="page" role="status" aria-live="polite">
      <p className="route-fallback">Loading page…</p>
    </div>
  );
}
