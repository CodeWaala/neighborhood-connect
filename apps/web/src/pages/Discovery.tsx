import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Baby, Dog, Coffee, Trees, MessageCircle, Clock,
    Users, Heart, Share2, Loader2, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  listMatches,
  type DiscoveryMatch,
  createConnection,
} from "@neighborhood-connect/api-client";
import AppHeader from "@/components/AppHeader";

const interestIcons: Record<string, React.ReactNode> = {
    "Stroller walks": <Baby className="w-3.5 h-3.5" />,
    "Coffee outings": <Coffee className="w-3.5 h-3.5" />,
    "Park visits": <Trees className="w-3.5 h-3.5" />,
    "Dog walks": <Dog className="w-3.5 h-3.5" />,
    "Casual chats": <MessageCircle className="w-3.5 h-3.5" />,
};

/** Format availability entries into a human-readable summary. */
function formatAvailability(
    availability: DiscoveryMatch["availability"],
): string {
    if (availability.length === 0) return "Not specified";

    const windowLabels = [...new Set(availability.map((a) => a.availabilityWindow.label))];
    const dayCodes = [...new Set(availability.map((a) => a.dayOfWeek))];

    const weekdays = ["mon", "tue", "wed", "thu", "fri"];
    const weekendDays = ["sat", "sun"];
    const isAllWeekdays = weekdays.every((d) => dayCodes.includes(d));
    const isAllWeekend = weekendDays.every((d) => dayCodes.includes(d));

    let dayLabel: string;
    if (isAllWeekdays && isAllWeekend) {
        dayLabel = "every day";
    } else if (isAllWeekdays) {
        dayLabel = "on weekdays";
    } else if (isAllWeekend) {
        dayLabel = "on weekends";
    } else {
        dayLabel = `${dayCodes.length} days/week`;
    }

    return `${windowLabels.join(" & ")} ${dayLabel}`;
}

// ────────────────────────────────────────────
// Components
// ────────────────────────────────────────────

const MatchCard = ({ match }: { match: DiscoveryMatch }) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const connectMutation = useMutation({
        mutationFn: (recipientId: string) => createConnection(recipientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discovery"] });
            navigate(`/connection-sent/${match.profile?.displayName ?? "Neighbor"}`);
        },
        onError: (error) => {
            toast({
                title: "Failed to send request",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        },
    });

    const displayName = match.profile?.displayName ?? "Neighbor";
    const role = match.profile?.role ?? "parent";
    const interests = match.interests.map((i) => i.interest.label);
    const availabilitySummary = formatAvailability(match.availability);

    const contextIcon =
        role === "pet" ? (
            <Dog className="w-4 h-4" />
        ) : role === "both" ? (
            <div className="flex gap-0.5">
                <Baby className="w-4 h-4" />
                <Dog className="w-4 h-4" />
            </div>
        ) : (
            <Baby className="w-4 h-4" />
        );

    const contextLabel =
        role === "pet" ? "Pet parent" : role === "both" ? "Parent & pet parent" : "Parent";

    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary font-semibold text-lg">
                        {displayName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{displayName}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {contextIcon}
                            <span>{contextLabel}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shared interests */}
            <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                    {interests.map((interest) => (
                        <span
                            key={interest}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                            {interestIcons[interest] ?? <Sparkles className="w-3.5 h-3.5" />}
                            {interest}
                        </span>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-5">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{availabilitySummary}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    variant="hero"
                    size="sm"
                    className="flex-1"
                    onClick={() => connectMutation.mutate(match.id)}
                    disabled={connectMutation.isPending}
                >
                    {connectMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            Sending…
                        </>
                    ) : (
                        "Connect"
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/profile/${match.id}`)}
                >
                    View Profile
                </Button>
            </div>
        </div>
    );
};

const MatchCardSkeleton = () => (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
        <div className="flex gap-2 mb-4">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-40 mb-5" />
        <div className="flex gap-3">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
    </div>
);

// Empty state component
const EmptyState = () => {
    const { toast } = useToast();

    const handleInvite = () => {
        toast({
            title: "Invite link copied!",
            description: "Share this link with your neighbors to help grow the community.",
        });
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="max-w-sm mx-auto">
                {/* Illustration */}
                <div className="mb-8 animate-fade-in">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary-soft flex items-center justify-center mb-6">
                        <Users className="w-12 h-12 text-primary" />
                    </div>
                    <div className="flex justify-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: "150ms" }} />
                        <div className="w-3 h-3 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-2xl font-bold text-foreground mb-3 animate-fade-in-up">
                    Your community is growing
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                    We're still finding neighbors who match your interests and schedule.
                    As more people join, you'll see great connections here.
                </p>

                {/* Encouragement */}
                <div
                    className="bg-accent/50 rounded-xl p-4 mb-8 animate-fade-in-up"
                    style={{ animationDelay: "150ms" }}
                >
                    <div className="flex items-center justify-center gap-2 text-primary mb-2">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">Quality over quantity</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        We only show you neighbors who truly share your interests and availability.
                        Good things take time.
                    </p>
                </div>

                {/* CTAs */}
                <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full"
                        onClick={handleInvite}
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Invite a Neighbor
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => window.location.reload()}
                    >
                        Check Back Later
                    </Button>
                </div>

                {/* Reassurance */}
                <p
                    className="text-xs text-muted-foreground mt-6 animate-fade-in"
                    style={{ animationDelay: "300ms" }}
                >
                    We'll notify you when new matches appear in your area.
                </p>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────

const Discovery = () => {
    const { data: matches, isLoading, isError } = useQuery({
        queryKey: ["discovery"],
        queryFn: () => listMatches(),
        staleTime: 2 * 60 * 1000,
    });

    const matchCount = matches?.length ?? 0;
    const isEmpty = !isLoading && matchCount === 0;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader
                right={matchCount > 0 ? (
                    <span className="text-sm text-muted-foreground">{matchCount} matches nearby</span>
                ) : undefined}
            />

            {/* Main content */}
            {isEmpty ? (
                <EmptyState />
            ) : (
                <main className="flex-1 px-4 py-6 pb-20">
                    <div className="max-w-lg mx-auto">
                        {/* Intro */}
                        <div className="mb-6 animate-fade-in">
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                Your matches
                            </h1>
                            <p className="text-muted-foreground">
                                Neighbors who share your interests and schedule. Quality over quantity.
                            </p>
                        </div>

                        {/* Error state */}
                        {isError && (
                            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 text-center">
                                <p className="text-sm text-destructive font-medium">
                                    Failed to load matches. Please try refreshing.
                                </p>
                            </div>
                        )}

                        {/* Loading skeletons */}
                        {isLoading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <MatchCardSkeleton key={i} />
                                ))}
                            </div>
                        )}

                        {/* Match cards */}
                        {matches && matches.length > 0 && (
                            <div className="space-y-4">
                                {matches.map((match, index) => (
                                    <div
                                        key={match.id}
                                        className="animate-fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <MatchCard match={match} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer note */}
                        {matches && matches.length > 0 && (
                            <p className="text-center text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
                                We show you a few great matches rather than endless options.
                                <br />
                                New neighbors join weekly.
                            </p>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
};

export default Discovery;
