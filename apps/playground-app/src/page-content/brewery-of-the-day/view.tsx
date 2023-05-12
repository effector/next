import { BreweryOfTheDay } from "#root/features/brewery-of-the-day";

export function BreweryOfTheDayPage({ type }: { type: string }) {
  return (
    <div>
      <h2>Top Brewery of the day (Page type is {type})</h2>
      <section>
        <BreweryOfTheDay />
      </section>
    </div>
  );
}
