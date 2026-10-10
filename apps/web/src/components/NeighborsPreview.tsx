import { useState } from 'react';
import NeighborCard from './NeighborCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Loader2, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const sampleNeighbors = [
  {
    name: 'Sarah M.',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    distance: '0.3 mi',
    interests: ['Morning walks', 'Playground'],
    availability: 'Weekday mornings',
    type: 'parent' as const,
    childOrPet: 'Mom of Emma, 3',
  },
  {
    name: 'James K.',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    distance: '0.5 mi',
    interests: ['Dog park', 'Trail walks'],
    availability: 'Evenings & weekends',
    type: 'pet' as const,
    childOrPet: 'Golden retriever, Max',
  },
  {
    name: 'Priya R.',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    distance: '0.4 mi',
    interests: ['Coffee walks', 'Stroller runs'],
    availability: 'Morning & afternoon',
    type: 'parent' as const,
    childOrPet: 'Mom of twins, 18mo',
  },
];

type ZipStatus = 'idle' | 'loading' | 'found' | 'not-found';

interface ZipResult {
  city: string;
  state: string;
}

async function lookupZip(zip: string): Promise<ZipResult | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      city: data.places[0]['place name'],
      state: data.places[0]['state abbreviation'],
    };
  } catch {
    return null;
  }
}

const NeighborsPreview = () => {
  const [zip, setZip] = useState('');
  const [status, setStatus] = useState<ZipStatus>('idle');
  const [result, setResult] = useState<ZipResult | null>(null);

  const isValidZip = /^\d{5}$/.test(zip);

  const handleLookup = async () => {
    if (!isValidZip || status === 'loading') return;
    setStatus('loading');
    setResult(null);
    const data = await lookupZip(zip);
    if (data) {
      setResult(data);
      setStatus('found');
    } else {
      setStatus('not-found');
    }
  };

  return (
    <section className="bg-warm-gradient py-16 md:py-24">
      <div className="container">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Your neighbors are waiting
          </h2>
          <p className="text-muted-foreground mx-auto max-w-md text-balance text-lg">
            Enter your zip code to see if NearbyPals is active in your area.
          </p>
        </div>

        {/* Zip lookup card */}
        <div className="mx-auto mb-14 max-w-md">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <label
              htmlFor="zip-input"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Your zip code
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="zip-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  placeholder="e.g. 94107"
                  value={zip}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setZip(val);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  className={cn(
                    'w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3',
                    'text-sm text-foreground placeholder:text-muted-foreground outline-none',
                    'transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20',
                  )}
                />
              </div>
              <Button
                variant="hero"
                onClick={handleLookup}
                disabled={!isValidZip || status === 'loading'}
                className="shrink-0 px-4"
                aria-label="Look up zip code"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Result: found */}
            {status === 'found' && result && (
              <div className="mt-4 animate-fade-in-up rounded-xl border border-primary/20 bg-primary-soft/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-1.5">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      2,400+ parents & pet parents near {result.city}, {result.state} are on
                      NearbyPals
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Join them — it&apos;s free and private.
                    </p>
                  </div>
                </div>
                <Button variant="hero" size="sm" className="group mt-3 w-full" asChild>
                  <Link to="/onboarding">
                    Join your neighbors
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Result: not found / invalid zip */}
            {status === 'not-found' && (
              <div className="mt-4 animate-fade-in-up rounded-xl border border-accent/20 bg-accent-soft/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 rounded-full bg-accent/10 p-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      NearbyPals is coming to {zip}!
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Be among the first in your neighborhood.
                    </p>
                  </div>
                </div>
                <Button variant="hero" size="sm" className="group mt-3 w-full" asChild>
                  <Link to="/onboarding">
                    Join the waitlist
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sample profiles */}
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Example profiles
        </p>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sampleNeighbors.map((neighbor, index) => (
            <div
              key={neighbor.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <NeighborCard {...neighbor} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NeighborsPreview;
