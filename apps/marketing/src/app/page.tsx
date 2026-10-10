export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <section className="bg-hero-gradient rounded-3xl border border-border/50 p-10 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          NearbyPals
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-foreground sm:text-5xl">
          Meet nearby parents and pet parents who share your routines.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A calm, privacy-first way to turn daily walks and coffee runs into real friendships.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://app.neighborhoodconnect.com"
            className="rounded-full bg-primary px-5 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Try the app
          </a>
          <a
            href="/how-it-works"
            className="rounded-full border border-border px-5 py-2 text-foreground hover:bg-muted"
          >
            How it works
          </a>
        </div>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Intent-driven matching",
            body: "We connect you based on shared interests and overlapping schedules, not endless feeds.",
          },
          {
            title: "Neighborhood-only",
            body: "Matches are limited to your neighborhood to keep things relevant and safe.",
          },
          {
            title: "Mutual consent",
            body: "Messaging is unlocked only after both people accept a connection.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-foreground">Built for trust</h2>
        <p className="mt-2 text-muted-foreground">
          We never show exact locations. Profiles are visible only to neighbors with shared routines.
        </p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <a href="/safety" className="hover:text-foreground">
            Safety standards
          </a>
          <a href="/privacy" className="hover:text-foreground">
            Privacy policy
          </a>
        </div>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            name: "Sarah M.",
            quote:
              "We met another family who walks the same park route. It felt effortless.",
          },
          {
            name: "Mike K.",
            quote: "Our dogs now have weekly playdates. The matching was spot on.",
          },
          {
            name: "Priya R.",
            quote: "It removed the awkwardness of finding parent friends in a new city.",
          },
        ].map((item) => (
          <div key={item.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">“{item.quote}”</p>
            <p className="mt-4 text-sm font-semibold text-foreground">{item.name}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-warm-gradient p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-foreground">Join the waitlist</h2>
        <p className="mt-2 text-muted-foreground">
          Early access is limited by neighborhood. Leave your email and we will reach out.
        </p>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="you@example.com"
            className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-sm"
          />
          <button
            type="button"
            className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Request access
          </button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          We will never sell your data.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Note: waitlist submission will be wired later.
        </p>
      </section>
    </div>
  );
}
