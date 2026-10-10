import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="about" className="border-border bg-card border-t py-12">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary-gradient flex h-10 w-10 items-center justify-center rounded-xl">
              <span className="text-xl">🏘️</span>
            </div>
            <span className="text-foreground text-xl font-bold">NearbyPals</span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <a href="#safety" className="text-muted-foreground hover:text-foreground transition-colors">
              Safety
            </a>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Made with love */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>Made with</span>
            <Heart className="text-accent fill-accent h-4 w-4" />
            <span>for neighbors</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
