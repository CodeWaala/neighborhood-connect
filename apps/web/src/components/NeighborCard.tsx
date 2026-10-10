type NeighborCardProps = {
    name: string;
    avatar: string;
    distance: string;
    interests: string[];
    availability: string;
    type: "parent" | "pet";
    childOrPet: string;
};

const NeighborCard = ({
    name,
    avatar,
    distance,
    interests,
    availability,
    type,
    childOrPet,
}: NeighborCardProps) => {
    const tagLabel = type === "parent" ? "Parent" : "Pet parent";

    return (
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <img
                    src={avatar}
                    alt={`${name} avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                    loading="lazy"
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-foreground">{name}</h3>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {tagLabel}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{childOrPet}</p>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-1">{distance} away</span>
                <span className="rounded-full bg-muted px-2 py-1">{availability}</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                    <span
                        key={interest}
                        className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                    >
                        {interest}
                    </span>
                ))}
            </div>
        </article>
    );
};

export default NeighborCard;