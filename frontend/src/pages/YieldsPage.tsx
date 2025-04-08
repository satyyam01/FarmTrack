export function YieldsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Yields</h1>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Add Yield
        </button>
      </div>
      <div className="rounded-lg border">
        <div className="p-4">
          <p className="text-muted-foreground">No yields recorded yet.</p>
        </div>
      </div>
    </div>
  )
}
