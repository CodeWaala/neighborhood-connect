import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sun, Dog, Coffee, Trees } from 'lucide-react';

const activities = [
  { icon: Sun, label: 'Morning walks', bg: 'bg-accent-soft', color: 'text-accent' },
  { icon: Coffee, label: 'Coffee runs', bg: 'bg-secondary', color: 'text-secondary-foreground' },
  { icon: Trees, label: 'Park visits', bg: 'bg-primary-soft', color: 'text-primary' },
  { icon: Dog, label: 'Dog walks', bg: 'bg-primary-soft', color: 'text-primary' },
];

const Hero = () => {
  return (
    <section className="bg-hero-gradient pb-20 pt-12 md:pb-28 md:pt-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          {/* Activity icons */}
          <div className="animate-fade-in mb-10 flex items-center justify-center gap-6 sm:gap-8">
            {activities.map(({ icon: Icon, label, bg, color }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`${bg} flex h-12 w-12 items-center justify-center rounded-full`}>
                  <Icon className={`${color} h-5 w-5`} />
                </div>
                <span className="text-muted-foreground text-xs">{label}</span>
              </div>
            ))}
          </div>

          {/* Headline */}
          <h1
            className="text-foreground animate-fade-in-up mb-6 text-balance text-3xl font-extrabold leading-tight md:text-4xl lg:text-5xl"
            style={{ animationDelay: '100ms' }}
          >
            Connect with nearby parents and pet parents through{' '}
            <span className="text-primary">shared routines</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-muted-foreground animate-fade-in-up mx-auto mb-10 max-w-lg text-balance text-lg md:text-xl"
            style={{ animationDelay: '200ms' }}
          >
            Local, safe, and intentional connections for your daily walks, park visits, and coffee
            runs.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-in-up flex flex-col justify-center gap-4 sm:flex-row"
            style={{ animationDelay: '300ms' }}
          >
            <Button variant="hero" size="lg" asChild>
              <Link to="/onboarding">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#how-it-works">How it works</a>
            </Button>
          </div>

          {/* Trust indicators */}
          <p
            className="text-muted-foreground animate-fade-in mt-10 text-sm"
            style={{ animationDelay: '500ms' }}
          >
            2,400+ neighbors connected · Private & safe · No ads, ever
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
