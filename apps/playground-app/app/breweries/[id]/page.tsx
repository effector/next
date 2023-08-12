import {
  breweryPage,
  breweriesFeatureStarted,
  $list,
  $currentBrewery,
  CurrentBrewery,
} from "#root/features/breweries";
import { allSettled, fork, serialize } from "effector";
import { EffectorNext } from "@effector/next";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const scope = fork();

  await allSettled(breweriesFeatureStarted, { scope });

  const list = scope.getState($list);

  return list.map((brewery) => ({ id: brewery.id })).slice(0, 3);
}

export default async function Page({ params }: { params: { id: string } }) {
  const scope = fork();

  await allSettled(breweryPage.open, { scope, params });

  const values = serialize(scope);

  if (!scope.getState($currentBrewery)) {
    notFound();
  }

  return (
    <EffectorNext values={values}>
      <section style={{ display: "flex", flexFlow: "column" }}>
        <h1>{scope.getState($currentBrewery)!.name}</h1>
        <CurrentBrewery />
      </section>
    </EffectorNext>
  );
}
