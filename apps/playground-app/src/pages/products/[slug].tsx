import { fork, serialize, allSettled } from "effector";
import { ProductDetails, productPage } from "#root/features/products";

export default function PageProduct() {
  return <ProductDetails />;
}

PageProduct.getInitialProps = async (req: any) => {
  const scope = fork();

  await allSettled(productPage.open, { scope, params: { id: req.query.slug } });

  return {
    // This is the `values` that is used at `_app.tsx` via EffectorNext provider
    values: serialize(scope),
  };
};
