import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    Baby, Dog, Coffee, Trees, MessageCircle, Clock,
    MapPin, Shield, ArrowLeft, Heart, Sparkles, Loader2, Check, Users,
} from "lucide-react";
import { getProfileById, type Profile as ProfileType } from "@/api/profile";
import { createConnection, listConnections, updateConnection } from "@/api/connections";
import AppHeader from "@/components/AppHeader";

const interestIcons: Record<string, React.ReactNode> = {
    "Stroller walks": <Baby className="w-4 h-4" />,
    "Coffee outings": <Coffee className="w-4 h-4" />,
    "Park visits": <Trees className="w-4 h-4" />,
    "Dog walks": <Dog className="w-4 h-4" />,
    "Casual chats": <MessageCircle className="w-4 h-4" />,
};

/** Expand short day codes to full names. */
const dayLabelMap: Record<string, string> = {
    mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
    fri: "Friday", sat: "Saturday", sun: "Sunday",
};

const ProfileSkeleton = () => (
    <div className="max-w-lg mx-auto space-y-6">
        {/* Summary card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-28" />
                </div>
            </div>
        </div>
        {/* Bio */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Interests */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
            <Skeleton className="h-5 w-20 mb-4" />
            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-8 w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
            </div>
        </div>
        {/* Availability */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
            </div>
        </div>
    </div>
);

const Profile = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { id } = useParams<{ id: string }>();
    const { userId: myId } = useAuth();

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ["profile", id],
        queryFn: () => getProfileById(id!),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });

    // Reuse the cached connections list to determine current connection state
    const { data: connections } = useQuery({
        queryKey: ["connections"],
        queryFn: listConnections,
        staleTime: 30_000,
    });

    const existingConnection = connections?.find(
        (c) =>
            (c.requesterId === myId && c.recipientId === id) ||
            (c.recipientId === myId && c.requesterId === id),
    );
    const connStatus = existingConnection?.status;           // "pending" | "accepted" | undefined
    const iAmRequester = existingConnection?.requesterId === myId;

    const connectMutation = useMutation({
        mutationFn: (recipientId: string) => createConnection(recipientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["discovery"] });
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            navigate(`/connection-sent/${profile?.displayName ?? "Neighbor"}`);
        },
        onError: (error) => {
            toast({
                title: "Failed to send request",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        },
    });

    const acceptMutation = useMutation({
        mutationFn: () => updateConnection(existingConnection!.id, "accepted"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            toast({ title: "Connection accepted! 🎉", description: "You can now message each other." });
        },
        onError: (error) => {
            toast({
                title: "Something went wrong",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        },
    });

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <AppHeader
                    left={
                        <button
                            onClick={() => navigate("/discovery")}
                            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
                            aria-label="Back to discovery"
                        >
                            <ArrowLeft className="w-5 h-5 text-foreground" />
                        </button>
                    }
                    title={<Skeleton className="h-5 w-32" />}
                />
                <main className="flex-1 px-4 py-6">
                    <ProfileSkeleton />
                </main>
            </div>
        );
    }

    // Not found / error
    if (isError || !profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Profile not found</p>
                    <Button variant="outline" onClick={() => navigate("/discovery")}>
                        Back to Matches
                    </Button>
                </div>
            </div>
        );
    }

    // Extract data from the profile response
    const displayName = profile.displayName;
    const role = profile.role;
    const bio = profile.bio;
    const neighborhoodName = profile.neighborhood?.name ?? "Unknown";
    const interests = profile.user?.interests?.map((ui) => ui.interest.label) ?? [];
    const availability = profile.user?.availability ?? [];

    // Deduplicate days and time windows
    const days = [...new Set(availability.map((a) => a.dayOfWeek))];
    const timeWindows = [...new Set(availability.map((a) => a.availabilityWindow.label))];

    const contextLabel =
        role === "pet" ? "Pet parent" : role === "both" ? "Parent & pet parent" : "Parent";

    const contextIcon =
        role === "pet" ? (
            <Dog className="w-5 h-5" />
        ) : role === "both" ? (
            <div className="flex gap-1">
                <Baby className="w-5 h-5" />
                <Dog className="w-5 h-5" />
            </div>
        ) : (
            <Baby className="w-5 h-5" />
        );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader
                left={
                    <button
                        onClick={() => navigate("/discovery")}
                        className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Back to discovery"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                }
                title={<span className="text-lg font-semibold text-foreground">{displayName}'s Profile</span>}
            />

            {/* Main content */}
            <main className="flex-1 px-4 py-6">
                <div className="max-w-lg mx-auto space-y-6">

                    {/* Profile Summary */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-soft animate-fade-in">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-2xl">
                                {displayName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    {contextIcon}
                                    <span>{contextLabel}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{neighborhoodName} neighborhood</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {bio && (
                        <div
                            className="bg-card border border-border rounded-2xl p-6 shadow-soft animate-fade-in-up"
                            style={{ animationDelay: "100ms" }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Heart className="w-5 h-5 text-accent" />
                                <h2 className="text-lg font-semibold text-foreground">About me</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{bio}</p>
                        </div>
                    )}

                    {/* Interests */}
                    {interests.length > 0 && (
                        <div
                            className="bg-card border border-border rounded-2xl p-6 shadow-soft animate-fade-in-up"
                            style={{ animationDelay: "200ms" }}
                        >
                            <h2 className="text-lg font-semibold text-foreground mb-4">Interests</h2>
                            <div className="flex flex-wrap gap-2">
                                {interests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                    >
                                        {interestIcons[interest] ?? <Sparkles className="w-4 h-4" />}
                                        {interest}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Availability */}
                    {(days.length > 0 || timeWindows.length > 0) && (
                        <div
                            className="bg-card border border-border rounded-2xl p-6 shadow-soft animate-fade-in-up"
                            style={{ animationDelay: "300ms" }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold text-foreground">Availability</h2>
                            </div>

                            <div className="space-y-4">
                                {days.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Days</p>
                                        <div className="flex flex-wrap gap-2">
                                            {days.map((day) => (
                                                <span
                                                    key={day}
                                                    className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
                                                >
                                                    {dayLabelMap[day] ?? day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {timeWindows.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Preferred time</p>
                                        <div className="flex flex-wrap gap-2">
                                            {timeWindows.map((time) => (
                                                <span
                                                    key={time}
                                                    className="px-3 py-1.5 rounded-full bg-accent/15 text-accent text-sm font-medium"
                                                >
                                                    {time}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Privacy Reassurance */}
                    <div
                        className="bg-primary-soft/50 border border-primary/20 rounded-2xl p-5 animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                    >
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-foreground text-sm mb-1">Your privacy matters</h3>
                                <p className="text-sm text-muted-foreground">
                                    Exact locations are never shared. You'll only see neighborhood-level info until you both agree to connect.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTAs — adapt to connection state */}
                    <div
                        className="flex flex-col gap-3 pt-2 animate-fade-in-up"
                        style={{ animationDelay: "500ms" }}
                    >
                        {/* No connection yet */}
                        {!connStatus && (
                            <Button
                                variant="hero"
                                size="xl"
                                className="w-full"
                                onClick={() => connectMutation.mutate(id!)}
                                disabled={connectMutation.isPending}
                            >
                                {connectMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
                                ) : (
                                    "Send Connection Request"
                                )}
                            </Button>
                        )}

                        {/* Pending — I sent the request */}
                        {connStatus === "pending" && iAmRequester && (
                            <Button variant="outline" size="xl" className="w-full" disabled>
                                <Clock className="w-4 h-4 mr-2" />
                                Request Sent · Waiting for response
                            </Button>
                        )}

                        {/* Pending — they sent the request, I can accept */}
                        {connStatus === "pending" && !iAmRequester && (
                            <Button
                                variant="hero"
                                size="xl"
                                className="w-full"
                                onClick={() => acceptMutation.mutate()}
                                disabled={acceptMutation.isPending}
                            >
                                {acceptMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Accepting…</>
                                ) : (
                                    <><Check className="w-4 h-4 mr-2" />Accept Connection Request</>
                                )}
                            </Button>
                        )}

                        {/* Already connected — go to messages */}
                        {connStatus === "accepted" && (
                            <Button
                                variant="hero"
                                size="xl"
                                className="w-full"
                                onClick={() => navigate(`/messages/${existingConnection!.id}`)}
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Message {displayName}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full"
                            onClick={() => navigate("/discovery")}
                        >
                            Back to Matches
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
