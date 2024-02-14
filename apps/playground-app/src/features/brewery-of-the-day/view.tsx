"use client";

import { reflect } from "@effector/reflect";
import { BreweryCard } from "#root/shared/ui";

import { $breweryOfTheDay } from "./model";

export const BreweryOfTheDay = reflect({
  view: BreweryCard,
  bind: {
    name: $breweryOfTheDay.map((brewery) => brewery?.name ?? "Unknown"),
    brewery_type: $breweryOfTheDay.map(
      (brewery) => brewery?.brewery_type ?? "nano"
    ),
    website_url: $breweryOfTheDay.map(
      (brewery) => brewery?.website_url ?? null
    ),
    image: $breweryOfTheDay.map((brewery) => brewery?.image ?? ""),
  },
});
