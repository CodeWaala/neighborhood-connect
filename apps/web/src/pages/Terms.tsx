import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => (
    <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
            <div className="mx-auto max-w-3xl px-6 py-14">
                <h1 className="text-3xl font-bold text-foreground">Terms of Use</h1>
                <p className="mt-3 text-muted-foreground">
                    By using NearbyPals you agree to these terms. Please read them carefully.
                </p>

                <div className="mt-10 space-y-8">
                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Eligibility</h2>
                        <p className="text-sm text-muted-foreground">
                            NearbyPals is intended for adults 18 years and older. By creating an account
                            you confirm that you meet this requirement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Acceptable use</h2>
                        <p className="text-sm text-muted-foreground">
                            You agree to use NearbyPals only for its intended purpose — meeting nearby
                            parents and pet parents for real-world connection. Harassment, spam, misuse of
                            personal data, or any illegal activity is strictly prohibited and will result
                            in immediate account removal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Your content</h2>
                        <p className="text-sm text-muted-foreground">
                            You own any content you post (bio, messages, photos). By submitting content
                            you grant NearbyPals a limited licence to display it to your matches. We will
                            never sell your content or use it for advertising.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Account termination</h2>
                        <p className="text-sm text-muted-foreground">
                            We reserve the right to suspend or delete accounts that violate these terms.
                            You may delete your account at any time from the app settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Limitation of liability</h2>
                        <p className="text-sm text-muted-foreground">
                            NearbyPals facilitates connections but is not responsible for interactions
                            that happen in the real world. Always exercise personal judgement and meet in
                            public places first.
                        </p>
                    </section>

                    <p className="text-xs text-muted-foreground border-t border-border pt-6">
                        Last updated May 2026. Questions? Contact us at{" "}
                        <a href="mailto:hello@nearbypals.com" className="text-primary hover:underline">
                            hello@nearbypals.com
                        </a>
                        .
                    </p>
                </div>
            </div>
        </main>
        <Footer />
    </div>
);

export default Terms;
