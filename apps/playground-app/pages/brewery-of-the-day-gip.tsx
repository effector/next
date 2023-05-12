import {
  BreweryOfTheDayPage,
  breweryOfTheDayPage,
} from "#root/page-content/brewery-of-the-day";
import { allSettled, fork, serialize } from "effector";

export default function Page() {
  return <BreweryOfTheDayPage type="getServerSideProps" />;
}

Page.getInitialProps = async () => {
  const scope = fork();

  await allSettled(breweryOfTheDayPage.open, { scope });

  return {
    /**
     * <EffectorNext /> provider will get this `values` prop in the _app.tsx
     */
    values: serialize(scope),
  };
};
