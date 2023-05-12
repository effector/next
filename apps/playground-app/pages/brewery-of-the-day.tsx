import {
  BreweryOfTheDayPage,
  breweryOfTheDayPage,
} from "#root/page-content/brewery-of-the-day";
import { allSettled, fork, serialize } from "effector";

export const getServerSideProps = async () => {
  const scope = fork();

  await allSettled(breweryOfTheDayPage.open, { scope });

  const values = serialize(scope);

  return {
    props: {
      /**
       * <EffectorNext /> provider will get this `values` prop in the _app.tsx
       */
      values,
    },
  };
};

export default function Page() {
  return <BreweryOfTheDayPage type="getServerSideProps" />;
}
