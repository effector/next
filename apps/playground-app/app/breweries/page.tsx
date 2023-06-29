import {
  BreweriesPage,
  breweriesPage,
} from "#root/page-content/breweries-list";
import { EffectorNext } from "@effector/next";
import { allSettled, fork, serialize } from "effector";
import { $counter } from '#root/features/async-counter/model'

export const revalidate = 1;

export default async function Page() {
  const scope = fork({values: new Map().set($counter, 47)});

  await allSettled(breweriesPage.open, { scope });

  const values = serialize(scope);

  return (
    <EffectorNext values={values}>
      <BreweriesPage />
    </EffectorNext>
  );
}
