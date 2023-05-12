"use client";

import { list } from "@effector/reflect";
import { BreweryCard, Button } from "#root/shared/ui";

import { $list, moreRequested, $pending, $currentBrewery } from "./model";
import { reflect } from "@effector/reflect";
import { Brewery } from "#root/shared/api";
import Link from "next/link";

export function BreweriesList() {
  return (
    <section style={{ display: "flex", flexFlow: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Breweries />
      </div>
      <MoreButton />
    </section>
  );
}

const Breweries = list({
  source: $list,
  view: (item: Brewery) => {
    return (
      <div style={{ display: "flex", flexFlow: "column" }}>
        <BreweryCard {...item}>
          <div style={{ display: "flex", flexFlow: "column" }}>
            <Link href={`/breweries-pages/${item.id}`}>Details</Link>
            <Link href={`/breweries/${item.id}`}>Details (app mode)</Link>
          </div>
        </BreweryCard>
      </div>
    );
  },
});

const MoreButton = reflect({
  view: Button,
  bind: {
    onClick: moreRequested.prepend(() => ({})),
    children: $pending.map((pending) => (pending ? "Loading..." : "More")),
  },
});

export const CurrentBrewery = reflect({
  view: BreweryCard,
  bind: {
    brewery_type: $currentBrewery.map(
      (brewery) => brewery?.brewery_type ?? "nano"
    ),
    name: $currentBrewery.map((brewery) => brewery?.name ?? ""),
    image: $currentBrewery.map((brewery) => brewery?.image ?? ""),
    website_url: $currentBrewery.map((brewery) => brewery?.website_url ?? ""),
  },
});
