import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, MessageCircle, Clock, Sparkles, Users } from "lucide-react";

const ConnectionSent = () => {
    const navigate = useNavigate();
    const { name } = useParams<{ name: string }>();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Main content */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="max-w-md mx-auto text-center">

                    {/* Success animation */}
                    <div
                        className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary-soft flex items-center justify-center animate-fade-in"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Heart className="w-8 h-8 text-primary fill-primary" />
                        </div>
                    </div>

                    {/* Confirmation message */}
                    <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                        <h1 className="text-2xl font-bold text-foreground mb-3">
                            Request sent! 🎉
                        </h1>
                        <p className="text-lg text-muted-foreground mb-2">
                            {name ? `${name} will be notified` : "Your request is on its way"}
                        </p>
                    </div>

                    {/* Explanation card */}
                    <div
                        className="bg-card border border-border rounded-2xl p-6 mt-8 shadow-soft animate-fade-in-up"
                        style={{ animationDelay: "200ms" }}
                    >
                        <h2 className="font-semibold text-foreground mb-4">What happens next?</h2>

                        <div className="space-y-4 text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Clock className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground text-sm">They'll review your profile</p>
                                    <p className="text-sm text-muted-foreground">
                                        Take your time — good connections are worth waiting for
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground text-sm">Once accepted</p>
                                    <p className="text-sm text-muted-foreground">
                                        You'll both be able to message and plan meetups
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MessageCircle className="w-4 h-4 text-accent" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground text-sm">Messaging unlocks</p>
                                    <p className="text-sm text-muted-foreground">
                                        Chat becomes available after mutual connection
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reassurance */}
                    <p
                        className="text-sm text-muted-foreground mt-6 animate-fade-in-up"
                        style={{ animationDelay: "300ms" }}
                    >
                        We'll notify you when there's an update.
                        <br />
                        No need to keep checking!
                    </p>

                    {/* CTAs */}
                    <div
                        className="mt-8 space-y-3 animate-fade-in-up"
                        style={{ animationDelay: "400ms" }}
                    >
                        <Button
                            variant="hero"
                            size="xl"
                            className="w-full"
                            onClick={() => navigate("/discovery")}
                        >
                            Back to Matches
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full"
                            onClick={() => navigate("/connections")}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            View My Connections
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConnectionSent;
