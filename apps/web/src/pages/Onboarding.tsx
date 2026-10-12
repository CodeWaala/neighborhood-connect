import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Shield, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  searchNeighborhoods,
  type Neighborhood,
} from "@neighborhood-connect/api-client";
import AppHeader from "@/components/AppHeader";
import OnboardingProgress from "@/components/OnboardingProgress";

const Onboarding = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Neighborhood[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const { neighborhoodId, neighborhoodName, displayName, setNeighborhood, setDisplayName } = useOnboarding();

    // Initialize query from saved state
    useEffect(() => {
        if (neighborhoodName) {
            setQuery(neighborhoodName);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        // Don't search if the query matches the already-selected neighborhood
        if (query === neighborhoodName && neighborhoodId) {
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const data = await searchNeighborhoods(query);
                setResults(data);
                setShowDropdown(data.length > 0);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, neighborhoodId, neighborhoodName]);

    const handleSelect = useCallback(
        (n: Neighborhood) => {
            const label = `${n.name}, ${n.city}`;
            setNeighborhood(n.id, label);
            setQuery(label);
            setShowDropdown(false);
        },
        [setNeighborhood],
    );

    const handleContinue = () => {
        if (neighborhoodId && displayName.trim()) {
            navigate("/onboarding/role");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader plain />
            <OnboardingProgress step={1} />

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center px-6 pb-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center mx-auto mb-6 animate-fade-in">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3 animate-fade-in-up">
                        Let's get you set up
                    </h1>

                    {/* Explanation */}
                    <p className="text-muted-foreground text-center mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                        We'll use your name and neighborhood to connect you with parents and pet owners nearby.
                    </p>

                    {/* Display name input */}
                    <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            Your first name
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g. Sarah"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-12 text-base"
                        />
                    </div>

                    {/* Neighborhood search */}
                    <div className="mb-6 relative animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            Your neighborhood
                        </label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search by ZIP or neighborhood name"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    // Clear selection if user edits after selecting
                                    if (neighborhoodId && e.target.value !== neighborhoodName) {
                                        setNeighborhood("", "");
                                    }
                                }}
                                onFocus={() => {
                                    if (results.length > 0 && query !== neighborhoodName) {
                                        setShowDropdown(true);
                                    }
                                }}
                                className="h-12 text-base"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Dropdown results */}
                        {showDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                                {results.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleSelect(n)}
                                        className={cn(
                                            "w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors",
                                            "border-b border-border/50 last:border-b-0",
                                            neighborhoodId === n.id && "bg-primary/10 text-primary",
                                        )}
                                    >
                                        <p className="font-medium text-foreground">{n.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {[n.city, n.region, n.postalCode].filter(Boolean).join(", ")}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected indicator */}
                        {neighborhoodId && (
                            <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {neighborhoodName}
                            </p>
                        )}
                    </div>

                    {/* Privacy reassurance */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 mb-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">
                            Your exact address is never shown. Neighbors only see your general area.
                        </p>
                    </div>

                    {/* CTA */}
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                        onClick={handleContinue}
                        disabled={!neighborhoodId || !displayName.trim()}
                    >
                        Continue
                    </Button>

                    {/* Inline validation hints */}
                    {(!neighborhoodId || !displayName.trim()) && (
                        <div className="mt-3 space-y-1 animate-fade-in">
                            {!displayName.trim() && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                    ↑ Enter your first name to continue
                                </p>
                            )}
                            {!neighborhoodId && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                    ↑ Search and select your neighborhood to continue
                                </p>
                            )}
                        </div>
                    )}

                    {/* Trust indicator */}
                    <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "500ms" }}>
                        <Users className="w-4 h-4" />
                        <span>Join 2,400+ neighbors in your area</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Onboarding;
