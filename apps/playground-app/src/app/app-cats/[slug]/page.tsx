import { fork, serialize, allSettled } from "effector";
import {
  CatDetails,
  catPage,
  $catKinds,
  catsListPage,
} from "#root/features/cats";

import { EffectorNext } from "@effector/next";

export const revalidate = 10;

export async function generateStaticParams() {
  const scope = fork();

  await allSettled(catsListPage.open, { scope, params: null });

  /**
   * `getState` usage is generally undesirable in production code
   *
   * except for the cases when you need to connect effector with another external system
   * `getStaticPaths` of Next.js is exactly that case
   */
  const catIds = scope.getState($catKinds);

  return catIds.map((id) => ({ slug: id }));
}

export default async function CatDetailsAppPage({ params }: any) {
  const scope = fork();

  await allSettled(catPage.open, { scope, params: { id: params.slug } });

  const values = serialize(scope);

  return (
    <EffectorNext values={values}>
      <CatDetails />
    </EffectorNext>
  );
}
