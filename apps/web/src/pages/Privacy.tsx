import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => (
    <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
            <div className="mx-auto max-w-3xl px-6 py-14">
                <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
                <p className="mt-3 text-muted-foreground">
                    We do not sell your data. We collect only what is needed to provide matching and
                    messaging features.
                </p>

                <div className="mt-10 space-y-8">
                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">What we collect</h2>
                        <p className="text-sm text-muted-foreground">
                            Email address, neighborhood, interests, availability, and optional profile
                            details (display name, bio, child/pet info). We do not store precise location
                            data — only your neighborhood.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">How we use it</h2>
                        <p className="text-sm text-muted-foreground">
                            Your data is used exclusively to match you with nearby neighbors and to enable
                            messaging with accepted connections. It is never shared with advertisers or
                            third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Your rights</h2>
                        <p className="text-sm text-muted-foreground">
                            You can request deletion of your account and all associated data at any time by
                            contacting us at{" "}
                            <a
                                href="mailto:privacy@nearbypals.com"
                                className="text-primary hover:underline"
                            >
                                privacy@nearbypals.com
                            </a>
                            .
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-semibold text-foreground mb-2">Data security</h2>
                        <p className="text-sm text-muted-foreground">
                            All data is transmitted over HTTPS and stored with industry-standard
                            encryption. Passwords are hashed and never stored in plain text.
                        </p>
                    </section>

                    <p className="text-xs text-muted-foreground border-t border-border pt-6">
                        Last updated May 2026. This policy may be updated as the product evolves.
                    </p>
                </div>
            </div>
        </main>
        <Footer />
    </div>
);

export default Privacy;
