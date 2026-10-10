import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Shield, Loader2 } from "lucide-react";
import { listMessages, sendMessage } from "@/api/messages";
import { getConnection } from "@/api/connections";

const Messages = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { connectionId } = useParams<{ connectionId: string }>();
    const { userId } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch connection details (other user's profile)
    const { data: connection, isLoading: isLoadingConn } = useQuery({
        queryKey: ["connection", connectionId],
        queryFn: () => getConnection(connectionId!),
        enabled: !!connectionId,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch messages with polling
    const { data: messages, isLoading: isLoadingMsgs } = useQuery({
        queryKey: ["messages", connectionId],
        queryFn: () => listMessages(connectionId!),
        enabled: !!connectionId,
        refetchInterval: 5000,
    });

    // Send message mutation
    const sendMutation = useMutation({
        mutationFn: (body: string) => sendMessage(connectionId!, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", connectionId] });
            setNewMessage("");
        },
        onError: (error) => {
            toast({
                title: "Failed to send message",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        },
    });

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Determine the other user
    const isRequester = connection?.requesterId === userId;
    const otherProfile = isRequester ? connection?.recipient?.profile : connection?.requester?.profile;
    const contactName = otherProfile?.displayName ?? "Neighbor";
    const contactRole =
        otherProfile?.role === "pet"
            ? "Pet parent"
            : otherProfile?.role === "both"
                ? "Parent & pet parent"
                : "Parent";

    const handleSend = () => {
        const text = newMessage.trim();
        if (!text) return;
        sendMutation.mutate(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const isLoading = isLoadingConn || isLoadingMsgs;

    if (!connectionId) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Conversation not found</p>
                    <Button variant="outline" onClick={() => navigate("/connections")}>
                        Back to Connections
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button
                        onClick={() => navigate("/connections")}
                        className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div className="flex items-center gap-3 flex-1">
                        {isLoadingConn ? (
                            <>
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-semibold">
                                    {contactName.charAt(0)}
                                </div>
                                <div>
                                    <h1 className="font-semibold text-foreground">{contactName}</h1>
                                    <p className="text-xs text-muted-foreground">{contactRole}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Safety reminder */}
            <div className="bg-primary-soft/50 border-b border-primary/10 px-4 py-3">
                <div className="max-w-lg mx-auto flex items-start gap-2">
                    <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                        Keep conversations respectful. Meet in public places first and trust your instincts.
                    </p>
                </div>
            </div>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto px-4 py-4">
                <div className="max-w-lg mx-auto space-y-4">
                    {isLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                                    <Skeleton className="h-16 w-3/5 rounded-2xl" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && messages && messages.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-sm">No messages yet. Say hello! 👋</p>
                        </div>
                    )}

                    {messages?.map((message) => {
                        const isMe = message.senderId === userId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-card border border-border text-foreground rounded-bl-md"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed">{message.body}</p>
                                    <p
                                        className={`text-[10px] mt-1.5 ${isMe
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        {formatTime(message.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Message input */}
            <div className="sticky bottom-0 bg-background border-t border-border p-4">
                <div className="max-w-lg mx-auto flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            style={{ minHeight: "48px", maxHeight: "120px" }}
                        />
                    </div>
                    <Button
                        variant="hero"
                        size="icon"
                        className="h-12 w-12 rounded-full flex-shrink-0"
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sendMutation.isPending}
                    >
                        {sendMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Messages;
