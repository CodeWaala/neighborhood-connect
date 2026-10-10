import { UserPlus, Search, Coffee } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Share your routine',
    description: 'Tell us when you usually go for walks, park visits, or coffee runs.',
  },
  {
    icon: Search,
    title: 'Find your neighbors',
    description: "We'll show you nearby parents and pet owners with matching schedules.",
  },
  {
    icon: Coffee,
    title: 'Meet in real life',
    description: 'Send a friendly wave and plan your first walk or coffee together.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">How it works</h2>
          <p className="text-muted-foreground mx-auto max-w-md text-balance text-lg">
            Three simple steps to find your neighborhood community
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="animate-fade-in-up relative text-center"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector line (hidden on mobile, shown between items on desktop) */}
              {index < steps.length - 1 && (
                <div className="from-primary/30 absolute left-[60%] top-10 hidden h-0.5 w-[80%] bg-gradient-to-r to-transparent md:block" />
              )}

              {/* Icon */}
              <div className="bg-primary-soft relative mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl">
                <step.icon className="text-primary h-8 w-8" />
                <span className="bg-accent text-accent-foreground absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-foreground mb-3 text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
