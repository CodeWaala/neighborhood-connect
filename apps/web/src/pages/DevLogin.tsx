import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Shield, LogIn, Terminal } from "lucide-react";
import AppHeader from "@/components/AppHeader";


const DevLogin = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, hasProfile, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Redirect authenticated users as an effect — never during render
    useEffect(() => {
        if (!isAuthenticated) return;
        if (hasProfile === true) {
            navigate("/discovery", { replace: true });
        } else if (hasProfile === false) {
            navigate("/onboarding", { replace: true });
        }
        // hasProfile === null → still resolving, wait for next render
    }, [isAuthenticated, hasProfile, navigate]);

    const handleLogin = async () => {
        setIsSubmitting(true);
        try {
            await login(email.trim() || undefined);
            toast({
                title: "Logged in!",
                description: email.trim() || "Created a new dev user.",
            });
            // Navigation happens automatically via the useEffect above
            // once hasProfile is resolved by AuthContext.login()
        } catch (error) {
            toast({
                title: "Login failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Could not reach the API. Is it running?",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader plain />

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center px-6 pb-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Dev badge */}
                    <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                            <Terminal className="w-3 h-3" />
                            DEV MODE
                        </div>
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mx-auto mb-6 animate-fade-in">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3 animate-fade-in-up">
                        Developer Login
                    </h1>

                    {/* Explanation */}
                    <p
                        className="text-muted-foreground text-center mb-8 animate-fade-in-up"
                        style={{ animationDelay: "100ms" }}
                    >
                        Enter an email to login as an existing user or create a new one.
                        Leave blank to auto-generate a test account.
                    </p>

                    {/* Input */}
                    <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        <Input
                            type="email"
                            placeholder="you@example.com (optional)"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !isSubmitting && handleLogin()}
                            className="h-12 text-base"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* CTA */}
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full animate-fade-in-up"
                        style={{ animationDelay: "300ms" }}
                        onClick={handleLogin}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Continue"}
                    </Button>

                    {/* Privacy note */}
                    <div
                        className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 mt-6 animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                    >
                        <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                            This login is for development only. In production, authentication
                            will be handled by AWS Cognito with secure OAuth2 flows.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DevLogin;
