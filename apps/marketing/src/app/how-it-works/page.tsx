export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-foreground">How it works</h1>
      <p className="mt-3 text-muted-foreground">
        NearbyPals helps parents and pet parents meet locally through shared routines.
      </p>
      <ol className="mt-8 space-y-6">
        <li className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">1. Share your routine</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick your neighborhood, interests, and availability windows.
          </p>
        </li>
        <li className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">2. Discover matches</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We surface a small set of neighbors who overlap with your routine.
          </p>
        </li>
        <li className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">3. Connect with consent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Messaging unlocks only after both people accept the connection.
          </p>
        </li>
      </ol>
    </div>
  );
}
