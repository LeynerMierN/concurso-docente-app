export default function Cargando() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="h-24 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
