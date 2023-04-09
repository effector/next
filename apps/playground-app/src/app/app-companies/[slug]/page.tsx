import { fork, serialize, allSettled } from "effector";
import { CompanyDetails, companyPage } from "#root/features/companies";

import { EffectorAppNext } from "#root/app/effector-provider";

export default async function CompanyDetailsAppPage({ params }: any) {
  const scope = fork();

  await allSettled(companyPage.open, { scope, params: { id: params.slug } });

  const values = serialize(scope);

  return (
    <EffectorAppNext values={values}>
      <CompanyDetails />
    </EffectorAppNext>
  );
}
