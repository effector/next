import { reflect, variant } from "@effector/reflect";
import { BreweryCard, Loader } from "#root/shared/ui";

import { $breweryOfTheDay } from "./model";

export const BreweryOfTheDay = variant({
  if: $breweryOfTheDay.map((brewery) => !!brewery),
  then: reflect({
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
  }),
  else: Loader,
});
