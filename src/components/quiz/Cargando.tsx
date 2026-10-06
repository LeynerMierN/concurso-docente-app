export default function Cargando() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="h-24 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" />
      <div className="h-64 motion-safe:animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700/60" />
    </div>
  );
}
