import { Button } from '@/components/ui/button';
import { Shield, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section id="safety" className="bg-hero-gradient py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-foreground mb-6 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            Ready to meet your neighbors?
          </h2>
          <p className="text-muted-foreground mx-auto mb-10 max-w-lg text-balance text-lg">
            Join 2,400+ parents and pet owners building real friendships in their neighborhoods.
          </p>

          <Button variant="hero" size="xl" className="mb-12" asChild>
            <Link to="/onboarding">Join NearbyPals — it's free</Link>
          </Button>

          {/* Trust badges */}
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="bg-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                <Shield className="text-primary h-6 w-6" />
              </div>
              <span className="text-foreground font-semibold">Verified profiles</span>
              <span className="text-muted-foreground text-sm">Safety first, always</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="bg-accent-soft flex h-12 w-12 items-center justify-center rounded-xl">
                <Users className="text-accent h-6 w-6" />
              </div>
              <span className="text-foreground font-semibold">Local only</span>
              <span className="text-muted-foreground text-sm">Real neighbors nearby</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="bg-secondary flex h-12 w-12 items-center justify-center rounded-xl">
                <Heart className="text-primary h-6 w-6" />
              </div>
              <span className="text-foreground font-semibold">No ads, no data selling</span>
              <span className="text-muted-foreground text-sm">Your privacy matters</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
