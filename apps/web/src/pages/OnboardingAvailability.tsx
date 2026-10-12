import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingProgress from "@/components/OnboardingProgress";
import AppHeader from "@/components/AppHeader";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sun, Sunset, Moon, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { listAvailabilityWindows } from "@neighborhood-connect/api-client";

const days = [
    { id: "mon", label: "Mon" },
    { id: "tue", label: "Tue" },
    { id: "wed", label: "Wed" },
    { id: "thu", label: "Thu" },
    { id: "fri", label: "Fri" },
    { id: "sat", label: "Sat" },
    { id: "sun", label: "Sun" },
];

// Map window labels to icons
const windowIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Morning: Sun,
    Afternoon: Sunset,
    Evening: Moon,
};

const OnboardingAvailability = () => {
    const navigate = useNavigate();
    const { availability, setAvailabilityEntries, submitOnboarding, isSubmitting } = useOnboarding();

    // Extract currently selected days and window IDs from the availability entries
    const selectedDaySet = new Set(availability.map((a) => a.dayOfWeek));
    const selectedWindowSet = new Set(availability.map((a) => a.availabilityId));

    // Local state for UI selections (derived from context on mount)
    const [selectedDays, setSelectedDays] = useState<string[]>(() =>
        Array.from(selectedDaySet),
    );
    const [selectedWindowIds, setSelectedWindowIds] = useState<string[]>(() =>
        Array.from(selectedWindowSet),
    );

    // Fetch availability windows from API
    const { data: windows, isLoading, isError } = useQuery({
        queryKey: ["availabilityWindows"],
        queryFn: listAvailabilityWindows,
        staleTime: 5 * 60 * 1000,
    });

    // Sync local selections to the onboarding context
    useEffect(() => {
        const entries = selectedDays.flatMap((day) =>
            selectedWindowIds.map((windowId) => ({
                availabilityId: windowId,
                dayOfWeek: day,
            })),
        );
        setAvailabilityEntries(entries);
    }, [selectedDays, selectedWindowIds, setAvailabilityEntries]);

    const toggleDay = (id: string) => {
        setSelectedDays((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
        );
    };

    const toggleWindow = (id: string) => {
        setSelectedWindowIds((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        );
    };

    const handleFinish = async () => {
        try {
            await submitOnboarding();
            navigate("/discovery", { replace: true });
        } catch {
            // Error already shown via toast in submitOnboarding
        }
    };

    const isValid = selectedDays.length > 0 && selectedWindowIds.length > 0;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader plain />
            <OnboardingProgress step={4} onBack={() => navigate("/onboarding/interests")} />

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center px-6 pb-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3 animate-fade-in-up">
                        When are you free?
                    </h1>

                    {/* Helper text */}
                    <p
                        className="text-muted-foreground text-center mb-8 animate-fade-in-up"
                        style={{ animationDelay: "100ms" }}
                    >
                        This helps coordinate meetups with neighbors who have similar schedules.
                    </p>

                    {/* Days selection */}
                    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        <h2 className="text-sm font-medium text-foreground mb-3">Days available</h2>
                        <div className="flex flex-wrap gap-2">
                            {days.map((day) => {
                                const isSelected = selectedDays.includes(day.id);
                                return (
                                    <button
                                        key={day.id}
                                        onClick={() => toggleDay(day.id)}
                                        className={cn(
                                            "w-11 h-11 rounded-full border-2 font-medium text-sm transition-all duration-200",
                                            "hover:border-primary/50 hover:bg-primary/5",
                                            isSelected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-card text-foreground"
                                        )}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time windows selection — loaded from API */}
                    <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        <h2 className="text-sm font-medium text-foreground mb-3">Preferred times</h2>
                        <div className="space-y-3">
                            {isLoading && (
                                <>
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
                                    ))}
                                </>
                            )}
                            {isError && (
                                <p className="text-destructive text-sm">
                                    Failed to load time windows. Please refresh and try again.
                                </p>
                            )}
                            {windows?.map((window) => {
                                const isSelected = selectedWindowIds.includes(window.id);
                                const Icon = windowIconMap[window.label] ?? Sun;
                                return (
                                    <button
                                        key={window.id}
                                        onClick={() => toggleWindow(window.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200",
                                            "hover:border-primary/50 hover:bg-primary/5",
                                            isSelected
                                                ? "border-primary bg-primary/10"
                                                : "border-border bg-card"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-primary-soft text-primary"
                                                )}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-foreground">{window.label}</p>
                                                <p className="text-sm text-muted-foreground">{window.timeRange}</p>
                                            </div>
                                        </div>
                                        {isSelected && <Check className="w-5 h-5 text-primary" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* CTA */}
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                        onClick={handleFinish}
                        disabled={!isValid || isSubmitting || isLoading}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Setting up your profile...
                            </>
                        ) : (
                            "Finish Setup"
                        )}
                    </Button>

                    {/* Hint */}
                    {!isValid && (
                        <p
                            className="text-sm text-muted-foreground text-center mt-4 animate-fade-in"
                            style={{ animationDelay: "450ms" }}
                        >
                            Select at least one day and one time
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OnboardingAvailability;
