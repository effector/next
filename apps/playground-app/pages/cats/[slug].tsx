import { fork, serialize, allSettled } from "effector";
import {
  CatDetails,
  catPage,
  catsListPage,
  $catKinds,
} from "#root/features/cats";

export default function PageCompanies() {
  return <CatDetails />;
}

export const getStaticPaths = async () => {
  const scope = fork();

  await allSettled(catsListPage.open, { scope, params: null });

  /**
   * `getState` usage is generally undesirable in production code
   *
   * except for the cases when you need to connect effector with another external system
   * `getStaticPaths` of Next.js is exactly that case
   */
  const catIds = scope.getState($catKinds);

  return {
    paths: catIds.map((id) => ({ params: { slug: id } })),
    fallback: true,
  };
};

export const getStaticProps = async (req: any) => {
  const scope = fork();

  await allSettled(catPage.open, { scope, params: { id: req.params.slug } });

  return {
    props: {
      // This is the `values` that is used at `_app.tsx` via EffectorNext provider
      values: serialize(scope),
    },
  };
};
