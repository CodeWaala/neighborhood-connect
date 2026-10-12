import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Baby,
    Dog,
    Heart,
    Coffee,
    Trees,
    MessageCircle,
    Sun,
    Sunset,
    Moon,
    Check,
    Shield,
    Save,
    Loader2,
    Sparkles,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  getMyProfile,
  updateProfile,
  replaceInterests,
  replaceAvailability,
  listInterests,
  listAvailabilityWindows,
} from "@neighborhood-connect/api-client";

// ────────────────────────────────────────────
// Static data (roles & days are not from API)
// ────────────────────────────────────────────

const roles = [
    { id: "parent", label: "Parent", icon: Baby },
    { id: "pet", label: "Pet Parent", icon: Dog },
    { id: "both", label: "Both", icon: Heart },
];

const days = [
    { id: "mon", label: "Mon" },
    { id: "tue", label: "Tue" },
    { id: "wed", label: "Wed" },
    { id: "thu", label: "Thu" },
    { id: "fri", label: "Fri" },
    { id: "sat", label: "Sat" },
    { id: "sun", label: "Sun" },
];

const interestIconMap: Record<string, React.ReactNode> = {
    "Stroller walks": <Baby className="w-4 h-4" />,
    "Coffee outings": <Coffee className="w-4 h-4" />,
    "Park visits": <Trees className="w-4 h-4" />,
    "Dog walks": <Dog className="w-4 h-4" />,
    "Casual chats": <MessageCircle className="w-4 h-4" />,
};

const timeWindowIconMap: Record<string, typeof Sun> = {
    Morning: Sun,
    Afternoon: Sunset,
    Evening: Moon,
};

// ────────────────────────────────────────────
// Loading skeleton
// ────────────────────────────────────────────

const ProfileEditSkeleton = () => (
    <div className="max-w-md mx-auto space-y-8 px-4 py-6">
        <Skeleton className="h-5 w-20" />
        <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
        </div>
        <Skeleton className="h-5 w-20" />
        <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
        </div>
        <Skeleton className="h-5 w-24" />
        <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-full" />
            ))}
        </div>
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
        </div>
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-24 rounded-xl" />
    </div>
);

// ────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────

const ProfileEdit = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    // Form state
    const [selectedRole, setSelectedRole] = useState("");
    const [childAgeRange, setChildAgeRange] = useState("");
    const [petInfo, setPetInfo] = useState("");
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [bio, setBio] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isInitialised, setIsInitialised] = useState(false);

    // Fetch current profile
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ["myProfile"],
        queryFn: getMyProfile,
    });

    // Fetch all interests from API
    const { data: allInterests } = useQuery({
        queryKey: ["interests"],
        queryFn: listInterests,
    });

    // Fetch all availability windows from API
    const { data: allWindows } = useQuery({
        queryKey: ["availabilityWindows"],
        queryFn: listAvailabilityWindows,
    });

    // Populate form once data loads
    useEffect(() => {
        if (!profile || isInitialised) return;

        setSelectedRole(profile.role);
        setBio(profile.bio ?? "");
        setChildAgeRange(profile.children?.[0]?.ageRange ?? "");
        setPetInfo(
            profile.pets?.[0]
                ? `${profile.pets[0].petType}${profile.pets[0].petName ? `, ${profile.pets[0].petName}` : ""}`
                : "",
        );

        if (profile.user) {
            setSelectedInterests(profile.user.interests.map((ui) => ui.interestId));
            const userDays = [...new Set(profile.user.availability.map((ua) => ua.dayOfWeek))];
            const userTimes = [...new Set(profile.user.availability.map((ua) => ua.availabilityId))];
            setSelectedDays(userDays);
            setSelectedTimes(userTimes);
        }

        setIsInitialised(true);
    }, [profile, isInitialised]);

    // Toggle helpers
    const toggleInterest = (id: string) => {
        setSelectedInterests((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const toggleDay = (id: string) => {
        setSelectedDays((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
        );
    };

    const toggleTime = (id: string) => {
        setSelectedTimes((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
        );
    };

    // Save handler
    const handleSave = async () => {
        if (selectedInterests.length === 0) {
            toast({ title: "Please select at least one interest", variant: "destructive" });
            return;
        }
        if (selectedDays.length === 0 || selectedTimes.length === 0) {
            toast({ title: "Please select your availability", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            // 1. Update profile (role, bio)
            await updateProfile({
                role: selectedRole as "parent" | "pet" | "both",
                bio: bio.trim() || undefined,
            });

            // 2. Replace interests
            await replaceInterests(selectedInterests);

            // 3. Replace availability (day × time window)
            const availabilityEntries = selectedDays.flatMap((day) =>
                selectedTimes.map((windowId) => ({
                    availabilityId: windowId,
                    dayOfWeek: day,
                })),
            );
            await replaceAvailability(availabilityEntries);

            // Invalidate caches
            queryClient.invalidateQueries({ queryKey: ["myProfile"] });
            queryClient.invalidateQueries({ queryKey: ["discovery"] });

            toast({ title: "Profile updated!", description: "Your changes have been saved." });
            navigate("/discovery");
        } catch (error) {
            toast({
                title: "Failed to save",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const isLoading = profileLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <AppHeader
                    left={
                        <button onClick={() => navigate("/discovery")} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors" aria-label="Back">
                            <ArrowLeft className="w-5 h-5 text-foreground" />
                        </button>
                    }
                    title={<h1 className="text-lg font-semibold text-foreground">Edit Profile</h1>}
                    right={
                        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-destructive" aria-label="Log out">
                            <LogOut className="w-5 h-5" />
                        </button>
                    }
                />
                <main className="flex-1">
                    <ProfileEditSkeleton />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader
                left={
                    <button onClick={() => navigate("/discovery")} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors" aria-label="Back">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                }
                title={<h1 className="text-lg font-semibold text-foreground">Edit Profile</h1>}
                right={
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-destructive" aria-label="Log out">
                        <LogOut className="w-5 h-5" />
                    </button>
                }
            />

            {/* Main content */}
            <main className="flex-1 px-4 py-6 pb-24">
                <div className="max-w-md mx-auto space-y-8">
                    {/* Role Section */}
                    <section className="animate-fade-in-up">
                        <h2 className="text-sm font-medium text-foreground mb-3">I am a...</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {roles.map((role) => {
                                const isSelected = selectedRole === role.id;
                                const Icon = role.icon;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                                            "hover:border-primary/50 hover:bg-primary/5",
                                            isSelected
                                                ? "border-primary bg-primary/10"
                                                : "border-border bg-card",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-primary-soft text-primary",
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{role.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Child/Pet Info Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
                        {(selectedRole === "parent" || selectedRole === "both") && (
                            <div className="mb-4">
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    Child age range
                                </label>
                                <input
                                    type="text"
                                    value={childAgeRange}
                                    onChange={(e) => setChildAgeRange(e.target.value)}
                                    placeholder="e.g., 2-3 years"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>
                        )}
                        {(selectedRole === "pet" || selectedRole === "both") && (
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    Pet info
                                </label>
                                <input
                                    type="text"
                                    value={petInfo}
                                    onChange={(e) => setPetInfo(e.target.value)}
                                    placeholder="e.g., Golden Retriever, 2 years"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                                />
                            </div>
                        )}
                    </section>

                    {/* Interests Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                        <h2 className="text-sm font-medium text-foreground mb-3">Interests</h2>
                        <div className="flex flex-wrap gap-2">
                            {allInterests?.map((interest) => {
                                const isSelected = selectedInterests.includes(interest.id);
                                return (
                                    <button
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all duration-200 text-sm",
                                            "hover:border-primary/50 hover:bg-primary/5",
                                            isSelected
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border bg-card text-foreground",
                                        )}
                                    >
                                        {interestIconMap[interest.label] ?? <Sparkles className="w-4 h-4" />}
                                        <span className="font-medium">{interest.label}</span>
                                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Availability Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                        <h2 className="text-sm font-medium text-foreground mb-3">Availability</h2>

                        {/* Days */}
                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Days available</p>
                            <div className="flex flex-wrap gap-2">
                                {days.map((day) => {
                                    const isSelected = selectedDays.includes(day.id);
                                    return (
                                        <button
                                            key={day.id}
                                            onClick={() => toggleDay(day.id)}
                                            className={cn(
                                                "w-10 h-10 rounded-full border-2 font-medium text-xs transition-all duration-200",
                                                "hover:border-primary/50 hover:bg-primary/5",
                                                isSelected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-card text-foreground",
                                            )}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Time windows from API */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Preferred times</p>
                            <div className="space-y-2">
                                {allWindows?.map((window) => {
                                    const isSelected = selectedTimes.includes(window.id);
                                    const Icon = timeWindowIconMap[window.label] ?? Sun;
                                    return (
                                        <button
                                            key={window.id}
                                            onClick={() => toggleTime(window.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200",
                                                "hover:border-primary/50 hover:bg-primary/5",
                                                isSelected
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border bg-card",
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-primary-soft text-primary",
                                                    )}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-foreground text-sm">{window.label}</p>
                                                    <p className="text-xs text-muted-foreground">{window.timeRange}</p>
                                                </div>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Bio Section */}
                    <section className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        <h2 className="text-sm font-medium text-foreground mb-3">About me</h2>
                        <Textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell neighbors a bit about yourself..."
                            className="min-h-[100px] resize-none rounded-xl border-2 border-border focus:border-primary"
                            maxLength={300}
                        />
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            {bio.length}/300 characters
                        </p>
                    </section>

                    {/* Privacy Notice */}
                    <section
                        className="bg-accent/50 rounded-xl p-4 animate-fade-in-up"
                        style={{ animationDelay: "250ms" }}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground mb-1">
                                    Your privacy matters
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Your profile is only visible to verified neighbors in your area.
                                    Personal details like your exact address are never shared.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Fixed Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
                <div className="max-w-md mx-auto">
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;
