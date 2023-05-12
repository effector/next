import { createEvent, sample } from "effector";

import { getBreweryOfTheDayQuery } from "#root/shared/api";

export const breweryOfTheDayRequested = createEvent();

sample({
  clock: breweryOfTheDayRequested,
  target: getBreweryOfTheDayQuery.refresh,
});

export const $breweryOfTheDay = getBreweryOfTheDayQuery.$data;
