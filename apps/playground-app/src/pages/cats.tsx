import { fork, serialize, allSettled } from "effector";
import { Cats, catsListPage } from "#root/features/cats";

export default function CompaniesPage() {
  return <Cats />;
}

export const getStaticProps = async () => {
  const scope = fork();

  await allSettled(catsListPage.open, { scope, params: null });

  return {
    props: {
      // This is the `values` that is used at `_app.tsx` via EffectorNext provider
      values: serialize(scope),
    },
    revalidate: 10,
  };
};
