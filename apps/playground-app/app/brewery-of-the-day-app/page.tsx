import { $breweryOfTheDay } from "#root/features/brewery-of-the-day";
import {
  BreweryOfTheDayPage,
  breweryOfTheDayPage,
} from "#root/page-content/brewery-of-the-day";
import { EffectorNext } from "@effector/next";
import { allSettled, fork, serialize } from "effector";
import { notFound } from "next/navigation";

export default async function Page() {
  const scope = fork();

  await allSettled(breweryOfTheDayPage.open, { scope });

  console.log($breweryOfTheDay)
  if (!scope.getState($breweryOfTheDay)) {
    notFound();
  }

  return (
    <EffectorNext values={serialize(scope)}>
      <BreweryOfTheDayPage type="RSC" />
    </EffectorNext>
  );
}
