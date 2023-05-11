import {
  BreweryOfTheDayPage,
  breweryOfTheDayPage,
} from "#root/page-content/brewery-of-the-day";
import { EffectorNext } from "@effector/next";
import { allSettled, fork, serialize } from "effector";

export default async function Page() {
  const scope = fork();

  await allSettled(breweryOfTheDayPage.open, { scope });

  return (
    <EffectorNext values={serialize(scope)}>
      <BreweryOfTheDayPage type="RSC" />
    </EffectorNext>
  );
}
