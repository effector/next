import { fork, serialize, allSettled } from "effector";
import { Cats, catsListPage } from "#root/features/cats";
import { createGSPFactory } from "nextjs-effector";

export default function CompaniesPage() {
  return <Cats />;
}

export const getStaticProps = createGSPFactory()({
  pageEvent: catsListPage.open,
});
