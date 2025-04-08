export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Total Animals</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Health Records</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Total Yields</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Return Logs</h2>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}
