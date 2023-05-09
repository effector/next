import { fork, serialize, allSettled } from "effector";
import { Products, productsListPage } from "#root/features/products";

export default function ProductsPage() {
  return <Products />;
}

ProductsPage.getInitialProps = async () => {
  const scope = fork();

  console.log("gip called");

  await allSettled(productsListPage.open, { scope, params: null });

  return {
    // This is the `values` that is used at `_app.tsx` via EffectorNext provider
    values: serialize(scope),
  };
};
