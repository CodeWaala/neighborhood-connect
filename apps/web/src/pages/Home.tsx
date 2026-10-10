export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-16">
      <div className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Neighborhood Connect
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">
          Make real-world connections nearby.
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Find parents and pet parents who share your routines, interests, and availability in your
          neighborhood.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          'Select your neighborhood and intent.',
          'Match with people who overlap on time and interests.',
          'Connect and plan an offline meetup.',
        ].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-700"
          >
            {item}
          </div>
        ))}
      </section>
    </main>
  );
}
