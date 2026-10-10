import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    listConnections,
    updateConnection,
    type Connection,
} from "@/api/connections";
import {
    Baby, Dog, MessageCircle, Clock, Users,
    Check, X, Loader2, ArrowLeft, Compass,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

/** Get the "other" user from a connection relative to the current user. */
function otherUser(conn: Connection, myId: string) {
    const isRequester = conn.requesterId === myId;
    const other = isRequester ? conn.recipient : conn.requester;
    return {
        id: isRequester ? conn.recipientId : conn.requesterId,
        name: other?.profile?.displayName ?? "Neighbor",
        role: (other?.profile?.role ?? "parent") as "parent" | "pet" | "both",
        bio: other?.profile?.bio ?? null,
    };
}

function roleIcon(role: "parent" | "pet" | "both") {
    if (role === "pet") return <Dog className="w-4 h-4" />;
    if (role === "both")
        return (
            <span className="flex gap-0.5">
                <Baby className="w-4 h-4" />
                <Dog className="w-4 h-4" />
            </span>
        );
    return <Baby className="w-4 h-4" />;
}

function roleLabel(role: "parent" | "pet" | "both") {
    if (role === "pet") return "Pet parent";
    if (role === "both") return "Parent & pet parent";
    return "Parent";
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// ────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────

const ConnectionCardSkeleton = () => (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
        <div className="flex gap-3">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
    </div>
);

const PendingRequestCard = ({
    conn,
    myId,
    onAccept,
    onDecline,
    isUpdating,
}: {
    conn: Connection;
    myId: string;
    onAccept: () => void;
    onDecline: () => void;
    isUpdating: boolean;
}) => {
    const other = otherUser(conn, myId);
    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary font-semibold text-lg">
                    {other.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{other.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {roleIcon(other.role)}
                        <span>{roleLabel(other.role)}</span>
                    </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(conn.requestedAt)}
                </span>
            </div>
            <div className="flex gap-3">
                <Button
                    variant="hero"
                    size="sm"
                    className="flex-1"
                    onClick={onAccept}
                    disabled={isUpdating}
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1.5" />}
                    Accept
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={onDecline}
                    disabled={isUpdating}
                >
                    <X className="w-4 h-4 mr-1.5" />
                    Decline
                </Button>
            </div>
        </div>
    );
};

const SentRequestCard = ({ conn, myId }: { conn: Connection; myId: string }) => {
    const other = otherUser(conn, myId);
    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm opacity-80">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-soft/50 flex items-center justify-center text-primary/70 font-semibold text-lg">
                    {other.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{other.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Waiting for response</span>
                    </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(conn.requestedAt)}
                </span>
            </div>
        </div>
    );
};

const ActiveConnectionCard = ({ conn, myId }: { conn: Connection; myId: string }) => {
    const navigate = useNavigate();
    const other = otherUser(conn, myId);
    return (
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center text-primary font-semibold text-lg">
                    {other.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{other.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {roleIcon(other.role)}
                        <span>{roleLabel(other.role)}</span>
                    </div>
                </div>
                <Button
                    variant="hero"
                    size="sm"
                    onClick={() => navigate(`/messages/${conn.id}`)}
                >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Message
                </Button>
            </div>
        </div>
    );
};

const EmptyState = () => {
    const navigate = useNavigate();
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary-soft flex items-center justify-center mb-6 animate-fade-in">
                    <Users className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-3 animate-fade-in-up">
                    No connections yet
                </h2>
                <p className="text-muted-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                    Discover neighbors to start connecting! Send requests to people who share your interests.
                </p>
                <Button
                    variant="hero"
                    size="lg"
                    className="w-full animate-fade-in-up"
                    style={{ animationDelay: "200ms" }}
                    onClick={() => navigate("/discovery")}
                >
                    <Compass className="w-4 h-4 mr-2" />
                    Discover Neighbors
                </Button>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────

const Connections = () => {
    const { userId } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: connections, isLoading, isError } = useQuery({
        queryKey: ["connections"],
        queryFn: listConnections,
        staleTime: 30_000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: "accepted" | "declined" }) =>
            updateConnection(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            toast({
                title: variables.status === "accepted" ? "Connection accepted! 🎉" : "Request declined",
                description:
                    variables.status === "accepted"
                        ? "You can now message each other."
                        : "The request has been removed.",
            });
        },
        onError: (error) => {
            toast({
                title: "Something went wrong",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        },
    });

    // Categorize connections
    const pendingReceived = connections?.filter(
        (c) => c.status === "pending" && c.recipientId === userId,
    ) ?? [];
    const pendingSent = connections?.filter(
        (c) => c.status === "pending" && c.requesterId === userId,
    ) ?? [];
    const accepted = connections?.filter((c) => c.status === "accepted") ?? [];

    const isEmpty = !isLoading && pendingReceived.length === 0 && pendingSent.length === 0 && accepted.length === 0;

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
                title={<span className="text-xl font-bold text-primary">Connections</span>}
                right={pendingReceived.length > 0 ? (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                        {pendingReceived.length} new
                    </span>
                ) : undefined}
            />

            {/* Error */}
            {isError && (
                <div className="px-4 pt-6">
                    <div className="max-w-lg mx-auto bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center">
                        <p className="text-sm text-destructive font-medium">
                            Failed to load connections. Please try refreshing.
                        </p>
                    </div>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <main className="flex-1 px-4 py-6 pb-20">
                    <div className="max-w-lg mx-auto space-y-4">
                        {[1, 2, 3].map((i) => (
                            <ConnectionCardSkeleton key={i} />
                        ))}
                    </div>
                </main>
            )}

            {/* Empty */}
            {isEmpty && <EmptyState />}

            {/* Content */}
            {!isLoading && !isEmpty && (
                <main className="flex-1 px-4 py-6 pb-20">
                    <div className="max-w-lg mx-auto space-y-8">
                        {/* Pending requests received */}
                        {pendingReceived.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Pending Requests ({pendingReceived.length})
                                </h2>
                                <div className="space-y-3">
                                    {pendingReceived.map((conn, index) => (
                                        <div
                                            key={conn.id}
                                            className="animate-fade-in-up"
                                            style={{ animationDelay: `${index * 80}ms` }}
                                        >
                                            <PendingRequestCard
                                                conn={conn}
                                                myId={userId!}
                                                onAccept={() => updateMutation.mutate({ id: conn.id, status: "accepted" })}
                                                onDecline={() => updateMutation.mutate({ id: conn.id, status: "declined" })}
                                                isUpdating={updateMutation.isPending}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Sent requests */}
                        {pendingSent.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Sent ({pendingSent.length})
                                </h2>
                                <div className="space-y-3">
                                    {pendingSent.map((conn, index) => (
                                        <div
                                            key={conn.id}
                                            className="animate-fade-in-up"
                                            style={{ animationDelay: `${index * 80}ms` }}
                                        >
                                            <SentRequestCard conn={conn} myId={userId!} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Active connections */}
                        {accepted.length > 0 && (
                            <section>
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Active Connections ({accepted.length})
                                </h2>
                                <div className="space-y-3">
                                    {accepted.map((conn, index) => (
                                        <div
                                            key={conn.id}
                                            className="animate-fade-in-up"
                                            style={{ animationDelay: `${index * 80}ms` }}
                                        >
                                            <ActiveConnectionCard conn={conn} myId={userId!} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            )}
        </div>
    );
};

export default Connections;
