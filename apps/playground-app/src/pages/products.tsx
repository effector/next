import { Products, productsListPage } from "#root/features/products";
import { createGIPFactory } from "nextjs-effector";

export default function ProductsPage() {
  return <Products />;
}

ProductsPage.getInitialProps = createGIPFactory()({
  pageEvent: productsListPage.open,
});
