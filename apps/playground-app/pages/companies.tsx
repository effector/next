import { fork, serialize, allSettled } from "effector";
import { Companies, companiesListPage } from "#root/features/companies";

export default function CompaniesPage() {
  return <Companies />;
}

export const getServerSideProps = async () => {
  const scope = fork();

  await allSettled(companiesListPage.open, { scope, params: null });

  return {
    props: {
      // This is the `values` that is used at `_app.tsx` via EffectorNext provider
      values: serialize(scope),
    },
  };
};
