import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/80 border-border/50 sticky top-0 z-50 border-b backdrop-blur-lg">
      <div className="container">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-gradient shadow-soft flex h-10 w-10 items-center justify-center rounded-xl">
              <span className="text-xl">🏘️</span>
            </div>
            <span className="text-foreground text-xl font-bold">NearbyPals</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              How it works
            </a>
            <a
              href="#safety"
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Safety
            </a>
            <a
              href="#about"
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              About
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dev-login">Log in</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/onboarding">Get started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hover:bg-secondary rounded-lg p-2 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="text-foreground h-6 w-6" />
            ) : (
              <Menu className="text-foreground h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-border animate-fade-in border-t py-4 md:hidden">
            <nav className="mb-6 flex flex-col gap-4">
              <a href="#how-it-works" className="text-foreground py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                How it works
              </a>
              <a href="#safety" className="text-foreground py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                Safety
              </a>
              <a href="#about" className="text-foreground py-2 font-medium" onClick={() => setIsMenuOpen(false)}>
                About
              </a>
            </nav>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/dev-login">Log in</Link>
              </Button>
              <Button variant="hero" className="w-full" asChild>
                <Link to="/onboarding">Get started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
