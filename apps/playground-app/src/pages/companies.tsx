import { fork, serialize, allSettled } from "effector";
import { Companies, companiesPage } from "#root/features/companies";

export default function PageCompanies() {
  return <Companies />;
}

export const getServerSideProps = async () => {
  const scope = fork();

  await allSettled(companiesPage.open, { scope });

  return {
    props: {
      // This is the `values` that is used at `_app.tsx` via EffectorNext provider
      values: serialize(scope),
    },
  };
};
