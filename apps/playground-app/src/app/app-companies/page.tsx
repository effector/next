import { fork, serialize, allSettled } from "effector";
import { Companies, companiesListPage } from "#root/features/companies";

import { EffectorAppNext } from "#root/app/effector-provider";

export default async function AppCompaniesPage() {
  /**
   * New app dir uses React Server Components by default.
   *
   * This means, that all data-fetching and other side-effects are all should be performed inside server component
   */

  /**
   * Workflow itself is the same, as for the getServerSideProps
   */
  const scope = fork();

  await allSettled(companiesListPage.open, { scope, params: null });

  const values = serialize(scope);

  /**
   * Except for that, the values should be provided to the EffectorAppNext provider
   * manually in every page - there is no common `pages/_app.tsx` file anymore
   */
  return (
    <EffectorAppNext values={values}>
      <Companies />
    </EffectorAppNext>
  );
}
