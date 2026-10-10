const faqs = [
  {
    question: "Is this a social network?",
    answer:
      "No. NearbyPals is purpose-built for real-world meetups, not endless feeds.",
  },
  {
    question: "Do you track my exact location?",
    answer:
      "No. We only use neighborhood-level data to keep matching relevant and safe.",
  },
  {
    question: "When can I message someone?",
    answer: "Messaging is unlocked only after both people accept a connection.",
  },
  {
    question: "Is this for parents and pet parents only?",
    answer:
      "Yes. The product is focused on parents of young children and pet parents.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-foreground">FAQ</h1>
      <p className="mt-3 text-muted-foreground">
        Common questions about how NearbyPals works.
      </p>
      <div className="mt-8 space-y-4">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-foreground">{item.question}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
