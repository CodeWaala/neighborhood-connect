import Link from "next/link";

type CityPageProps = {
  params: { city: string };
};

const cities = ["san-francisco", "austin", "seattle", "new-york", "chicago"];

export function generateStaticParams() {
  return cities.map((city) => ({ city }));
}

export default function CityPage({ params }: CityPageProps) {
  const cityName = params.city.replace("-", " ");

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold text-foreground">
        NearbyPals in {cityName}
      </h1>
      <p className="mt-3 text-muted-foreground">
        Meet nearby parents and pet parents in {cityName}. Join the waitlist to get notified when we
        launch in your area.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
        <p className="text-sm text-muted-foreground">
          We are expanding city by city. Want to bring NearbyPals to {cityName}?
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Request access
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-border px-5 py-2 text-sm text-foreground hover:bg-muted"
          >
            How it works
          </Link>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Cities:{" "}
        {cities.map((city) => (
          <Link key={city} href={`/cities/${city}`} className="mr-2 hover:text-foreground">
            {city.replace("-", " ")}
          </Link>
        ))}
      </p>
    </div>
  );
}
