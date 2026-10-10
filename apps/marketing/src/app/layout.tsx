import type { Metadata } from "next";
import Link from "next/link";
import { Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NearbyPals",
  description: "Connect with nearby parents and pet parents through shared routines.",
  metadataBase: new URL("https://nearbyPals.com"),
  openGraph: {
    title: "NearbyPals",
    description: "Connect with nearby parents and pet parents through shared routines.",
    url: "https://nearbyPals.com",
    siteName: "NearbyPals",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NearbyPals",
    description: "Connect with nearby parents and pet parents through shared routines.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <span className="bg-primary-gradient shadow-soft flex h-9 w-9 items-center justify-center rounded-xl text-lg">
                  🏘️
                </span>
                <span className="text-foreground text-xl font-bold">NearbyPals</span>
              </Link>

              {/* Nav links */}
              <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                <Link href="/how-it-works" className="font-medium hover:text-foreground transition-colors">
                  How it works
                </Link>
                <Link href="/safety" className="font-medium hover:text-foreground transition-colors">
                  Safety
                </Link>
                <Link href="/privacy" className="font-medium hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/faq" className="font-medium hover:text-foreground transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="font-medium hover:text-foreground transition-colors">
                  Contact
                </Link>
              </nav>

              {/* CTA */}
              <div className="flex items-center gap-3">
                <a
                  href="https://app.nearbyPals.com/dev-login"
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Log in
                </a>
                <a
                  href="https://app.nearbyPals.com/onboarding"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get started
                </a>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>NearbyPals © 2026</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
                <Link href="/safety" className="hover:text-foreground">
                  Safety
                </Link>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
