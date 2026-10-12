import { useNavigate } from "react-router-dom";
import OnboardingProgress from "@/components/OnboardingProgress";
import AppHeader from "@/components/AppHeader";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Baby, Coffee, Trees, Dog, MessageCircle, Check, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { listInterests } from "@neighborhood-connect/api-client";

// Map interest labels to icons
const interestIconMap: Record<string, React.ReactNode> = {
    "Stroller walks": <Baby className="w-5 h-5" />,
    "Coffee outings": <Coffee className="w-5 h-5" />,
    "Park visits": <Trees className="w-5 h-5" />,
    "Dog walks": <Dog className="w-5 h-5" />,
    "Casual chats": <MessageCircle className="w-5 h-5" />,
};

const OnboardingInterests = () => {
    const navigate = useNavigate();
    const { interestIds, setInterestIds } = useOnboarding();

    // Fetch interests from API
    const { data: interests, isLoading, isError } = useQuery({
        queryKey: ["interests"],
        queryFn: listInterests,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const toggleInterest = (id: string) => {
        const next = interestIds.includes(id)
            ? interestIds.filter((i) => i !== id)
            : [...interestIds, id];
        setInterestIds(next);
    };

    const handleNext = () => {
        if (interestIds.length > 0) {
            navigate("/onboarding/availability");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader plain />
            <OnboardingProgress step={3} onBack={() => navigate("/onboarding/role")} />

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center px-6 pb-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3 animate-fade-in-up">
                        What do you enjoy?
                    </h1>

                    {/* Helper text */}
                    <p
                        className="text-muted-foreground text-center mb-8 animate-fade-in-up"
                        style={{ animationDelay: "100ms" }}
                    >
                        Pick all that apply. Shared interests help us find your best matches.
                    </p>

                    {/* Interest chips — loaded from API */}
                    <div
                        className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in-up"
                        style={{ animationDelay: "200ms" }}
                    >
                        {isLoading && (
                            <>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Skeleton key={i} className="h-12 w-36 rounded-full" />
                                ))}
                            </>
                        )}
                        {isError && (
                            <p className="text-destructive text-sm">
                                Failed to load interests. Please refresh and try again.
                            </p>
                        )}
                        {interests?.map((interest) => {
                            const isSelected = interestIds.includes(interest.id);
                            const icon = interestIconMap[interest.label] ?? <Sparkles className="w-5 h-5" />;
                            return (
                                <button
                                    key={interest.id}
                                    onClick={() => toggleInterest(interest.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-3 rounded-full border-2 transition-all duration-200",
                                        "hover:border-primary/50 hover:bg-primary/5",
                                        isSelected
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-border bg-card text-foreground"
                                    )}
                                >
                                    {icon}
                                    <span className="font-medium">{interest.label}</span>
                                    {isSelected && <Check className="w-4 h-4 ml-1" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selection count */}
                    <p
                        className="text-sm text-muted-foreground text-center mb-6 animate-fade-in"
                        style={{ animationDelay: "300ms" }}
                    >
                        {interestIds.length === 0
                            ? "Select at least one interest"
                            : `${interestIds.length} selected`}
                    </p>

                    {/* CTA */}
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                        onClick={handleNext}
                        disabled={interestIds.length === 0 || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Next"
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default OnboardingInterests;
