import { fork, serialize, allSettled } from "effector";
import { Cats, catsListPage } from "#root/features/cats";

import { EffectorNext } from "@effector/next";

export const revalidate = 10;

export default async function CatsListAppPage() {
  const scope = fork();

  await allSettled(catsListPage.open, { scope });

  const values = serialize(scope);

  return (
    <EffectorNext values={values}>
      <Cats />
    </EffectorNext>
  );
}
