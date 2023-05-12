import { BreweryCard } from "#root/shared/ui";
import { useUnit } from "effector-react";
import {
  breweryPage,
  breweriesFeatureStarted,
  $list,
  $currentBrewery,
} from "#root/features/breweries";
import { allSettled, fork, serialize } from "effector";
import { useRouter } from "next/router";

export const getStaticPaths = async () => {
  const scope = fork();

  await allSettled(breweriesFeatureStarted, { scope });

  const list = scope.getState($list);

  return {
    paths: list.map((brewery) => ({ params: { id: brewery.id } })),
    fallback: true,
  };
};

export const getStaticProps = async ({
  params,
}: {
  params: { id: string };
}) => {
  const scope = fork();

  await allSettled(breweryPage.open, { scope, params });

  const values = serialize(scope);

  return {
    props: {
      values,
    },
  };
};

export default function Page() {
  const brewery = useUnit($currentBrewery);
  const router = useRouter();

  if (router.isFallback) {
    return <div>loading...</div>;
  }

  if (!brewery) {
    return <div>not found</div>;
  }

  return (
    <section>
      <h1>{brewery.name}</h1>
      <BreweryCard {...brewery} />
    </section>
  );
}
