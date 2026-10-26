/** Esqueleto mostrado na hora ao trocar de página no painel/admin, enquanto os dados chegam. */
export function PageLoading() {
  return (
    <div className="max-w-4xl animate-pulse" aria-busy="true" aria-label="Carregando">
      <div className="h-8 w-56 rounded-md bg-neutral-200" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-neutral-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-lg bg-neutral-200" />
        <div className="h-28 rounded-lg bg-neutral-200" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-16 rounded-lg bg-neutral-200" />
        <div className="h-16 rounded-lg bg-neutral-200" />
        <div className="h-16 rounded-lg bg-neutral-200" />
      </div>
    </div>
  );
}
