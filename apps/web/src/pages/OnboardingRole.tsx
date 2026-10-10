import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Baby, Dog, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding, type OnboardingRole as RoleType } from "@/contexts/OnboardingContext";
import OnboardingProgress from "@/components/OnboardingProgress";

interface RoleCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
    delay: string;
}

const RoleCard = ({ icon, title, description, selected, onClick, delay }: RoleCardProps) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 animate-fade-in-up",
            "hover:border-primary/50 hover:bg-primary/5",
            selected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border bg-card"
        )}
        style={{ animationDelay: delay }}
    >
        <div className="flex items-start gap-4">
            <div
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    selected ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"
                )}
            >
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    </button>
);

const OnboardingRolePage = () => {
    const navigate = useNavigate();
    const { role, setRole } = useOnboarding();

    const handleNext = () => {
        if (role) {
            navigate("/onboarding/interests");
        }
    };

    const roles: { id: RoleType; icon: React.ReactNode; title: string; description: string }[] = [
        {
            id: "parent",
            icon: <Baby className="w-6 h-6" />,
            title: "Parent of young child",
            description: "Ages 0–5 years. Morning walks, playground visits, nap schedules.",
        },
        {
            id: "pet",
            icon: <Dog className="w-6 h-6" />,
            title: "Pet parent",
            description: "Daily walks, dog parks, pet-friendly hangouts.",
        },
        {
            id: "both",
            icon: <Heart className="w-6 h-6" />,
            title: "Both",
            description: "You've got your hands full! We'll match you with both communities.",
        },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <AppHeader plain />
            <OnboardingProgress step={2} onBack={() => navigate("/onboarding")} />

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-center px-6 pb-12">
                <div className="max-w-md mx-auto w-full">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3 animate-fade-in-up">
                        What brings you here?
                    </h1>

                    {/* Helper text */}
                    <p
                        className="text-muted-foreground text-center mb-8 animate-fade-in-up"
                        style={{ animationDelay: "100ms" }}
                    >
                        This helps us match you with neighbors who share similar routines.
                    </p>

                    {/* Role cards */}
                    <div className="space-y-4 mb-8">
                        {roles.map((r, index) => (
                            <RoleCard
                                key={r.id}
                                icon={r.icon}
                                title={r.title}
                                description={r.description}
                                selected={role === r.id}
                                onClick={() => setRole(r.id)}
                                delay={`${150 + index * 100}ms`}
                            />
                        ))}
                    </div>

                    {/* CTA */}
                    <Button
                        variant="hero"
                        size="lg"
                        className="w-full animate-fade-in-up"
                        style={{ animationDelay: "450ms" }}
                        onClick={handleNext}
                        disabled={!role}
                    >
                        Next
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default OnboardingRolePage;
