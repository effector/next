import { fork, serialize, allSettled } from "effector";
import { CompanyDetails, companyPage } from "#root/features/companies";

export default function PageCompanies() {
  return <CompanyDetails />;
}

export const getServerSideProps = async (req: any) => {
  const scope = fork();

  await allSettled(companyPage.open, { scope, params: { id: req.query.slug } });

  return {
    props: {
      // This is the `values` that is used at `_app.tsx` via EffectorNext provider
      values: serialize(scope),
    },
  };
};
