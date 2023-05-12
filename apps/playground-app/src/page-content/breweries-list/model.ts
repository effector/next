import { sample } from "effector";
import { declarePage } from "#root/shared/app";
import { breweriesFeatureStarted } from "#root/features/breweries";

export const breweriesPage = declarePage({
  pageType: "breweries",
});

sample({
  clock: breweriesPage.open,
  target: breweriesFeatureStarted,
});
