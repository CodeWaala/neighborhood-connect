export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-foreground">Safety</h1>
      <p className="mt-3 text-muted-foreground">
        Safety and trust are core to NearbyPals. We prioritize privacy and consent.
      </p>
      <ul className="mt-8 space-y-4">
        <li className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Neighborhood-only visibility</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We never show exact locations. Matches are limited to your neighborhood.
          </p>
        </li>
        <li className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Mutual consent</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Messaging is unlocked only after both people accept a connection.
          </p>
        </li>
        <li className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground">Minimal data collection</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We collect only what is needed to match you with nearby neighbors.
          </p>
        </li>
      </ul>
    </div>
  );
}
