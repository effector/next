import {
  BreweriesPage,
  breweriesPage,
} from "#root/page-content/breweries-list";
import { allSettled, fork, serialize } from "effector";

export const getStaticProps = async () => {
  const scope = fork();

  await allSettled(breweriesPage.open, { scope });

  const values = serialize(scope);

  return {
    props: {
      values,
    },
    revalidate: 1,
  };
};

export default function Page() {
  return <BreweriesPage />;
}
