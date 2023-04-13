import { Companies, companiesListPage } from "#root/features/companies";
import { createGSSPFactory } from "nextjs-effector";

export default function CompaniesPage() {
  return <Companies />;
}

export const getServerSideProps = createGSSPFactory()({
  pageEvent: companiesListPage.open,
});
