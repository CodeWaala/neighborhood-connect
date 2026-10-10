import { Sun, Coffee, TreePine, Moon } from 'lucide-react';

const routines = [
  {
    icon: Sun,
    time: 'Morning',
    activities: ['Early walks', 'Coffee runs', 'School drop-off'],
    color: 'bg-accent-soft text-accent',
  },
  {
    icon: Coffee,
    time: 'Midday',
    activities: ['Lunch at the park', 'Stroller walks', 'Playdates'],
    color: 'bg-primary-soft text-primary',
  },
  {
    icon: TreePine,
    time: 'Afternoon',
    activities: ['Playground time', 'Dog park visits', 'After-school hangouts'],
    color: 'bg-secondary text-secondary-foreground',
  },
  {
    icon: Moon,
    time: 'Evening',
    activities: ['Sunset walks', 'Weekend meetups', 'Neighborhood socials'],
    color: 'bg-muted text-muted-foreground',
  },
];

const Routines = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Match by routine, not algorithms
          </h2>
          <p className="text-muted-foreground mx-auto max-w-lg text-balance text-lg">
            We connect you based on when you're actually free — making meetups natural, not forced.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {routines.map((routine, index) => (
            <div
              key={routine.time}
              className="bg-card border-border/50 shadow-soft hover:shadow-card animate-scale-in rounded-2xl border p-6 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${routine.color} mb-4`}
              >
                <routine.icon className="h-6 w-6" />
              </div>

              <h3 className="text-foreground mb-3 text-lg font-bold">{routine.time}</h3>

              <ul className="space-y-2">
                {routine.activities.map((activity) => (
                  <li
                    key={activity}
                    className="text-muted-foreground flex items-center gap-2 text-sm"
                  >
                    <span className="bg-primary/40 h-1.5 w-1.5 rounded-full" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Routines;
