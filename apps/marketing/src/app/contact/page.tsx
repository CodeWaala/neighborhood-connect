export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-foreground">Contact</h1>
      <p className="mt-3 text-muted-foreground">
        Interested in partnerships or early access? Send us a note.
      </p>
      <form className="mt-8 space-y-4">
        <input
          type="text"
          placeholder="Full name"
          className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm"
        />
        <textarea
          placeholder="How can we help?"
          rows={4}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm"
        />
        <button
          type="button"
          className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Send message
        </button>
        <p className="text-xs text-muted-foreground">
          This form is a placeholder for now. We will wire it to a real backend later.
        </p>
      </form>
    </div>
  );
}
