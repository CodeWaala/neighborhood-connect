export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-foreground">Privacy Policy</h1>
      <p className="mt-3 text-muted-foreground">
        This is a lightweight summary. We do not sell data and we collect only what is needed to
        provide matching and messaging features.
      </p>
      <div className="mt-8 space-y-4 text-sm text-muted-foreground">
        <p>
          Data collected: email, neighborhood, interests, availability, and optional profile details.
        </p>
        <p>We do not store precise location data.</p>
        <p>You can request data deletion at any time.</p>
      </div>
    </div>
  );
}
