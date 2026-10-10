import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

const Contact = () => {
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder — wire to a real backend or form service later
        toast({
            title: "Message received!",
            description: "We'll get back to you within a couple of days.",
        });
        setName("");
        setEmail("");
        setMessage("");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="mx-auto max-w-lg px-6 py-14">
                    <h1 className="text-3xl font-bold text-foreground">Contact us</h1>
                    <p className="mt-3 text-muted-foreground">
                        Questions, feedback, or partnership enquiries — we'd love to hear from you.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                                Full name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Smith"
                                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jane@example.com"
                                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                                Message
                            </label>
                            <textarea
                                id="message"
                                required
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="How can we help?"
                                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                            />
                        </div>

                        <Button type="submit" variant="hero" size="lg" className="w-full">
                            <Send className="w-4 h-4 mr-2" />
                            Send message
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                            Or email us directly at{" "}
                            <a href="mailto:hello@nearbypals.com" className="text-primary hover:underline">
                                hello@nearbypals.com
                            </a>
                        </p>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Contact;
