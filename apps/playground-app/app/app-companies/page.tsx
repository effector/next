import { fork, serialize, allSettled } from "effector";
import { Companies, companiesListPage } from "#root/features/companies";

import { EffectorNext } from "@effector/next";

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

  return (
    <EffectorNext values={values}>
      <Companies />
    </EffectorNext>
  );
}
