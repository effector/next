import { sample } from "effector";
import { declarePage } from "#root/shared/app";
import { breweryOfTheDayRequested } from "#root/features/brewery-of-the-day/model";

export const breweryOfTheDayPage = declarePage({
  pageType: "breweryOfTheDay",
});

sample({
  clock: breweryOfTheDayPage.open,
  target: breweryOfTheDayRequested,
});
