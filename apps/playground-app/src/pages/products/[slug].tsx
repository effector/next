import { ProductDetails, productPage } from "#root/features/products";
import { createGIPFactory } from "nextjs-effector";

export default function PageProduct() {
  return <ProductDetails />;
}

PageProduct.getInitialProps = createGIPFactory()<{ slug: string }>({
  pageEvent: productPage.open.prepend(({ query }) => ({ id: query.id })),
});
