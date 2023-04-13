"use client";

import Image from "next/image";
import { reflect, list, variant } from "@effector/reflect";
import { StoreValue } from "effector";
import { useUnit } from "effector-react";
import Link from "next/link";

import { $productsList, $currentProduct } from "./model";

export const Products = () => {
  return (
    <div>
      <h1>Products</h1>
      <ul>
        <ProductsList />
      </ul>
    </div>
  );
};

export const ProductDetails = () => {
  const product = useUnit($currentProduct);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>Product Details</h1>
      <h2>{product.name}</h2>
      <Image src={product.imageLink} alt={product.name} width={250} height={250} />
      <p>{product.description}</p>
    </div>
  );
};

const ProductItem = reflect({
  view: ({
    id,
    name,
    imageLink,
    description,
  }: StoreValue<typeof $productsList>[number]) => (
    <li>
      <h2>{name}</h2>
      <Image src={imageLink} alt={name} width={250} height={250} />
      <p>{description}</p>
      <div>
        <Link href={`/products/${id}`}>Details</Link>
      </div>
    </li>
  ),
  bind: {},
});

const ProductsList = variant({
  if: $productsList.map((list) => list.length > 0),
  then: list({
    view: ProductItem,
    source: $productsList,
    getKey: (item) => item.id,
  }),
  else: () => <div>No products loaded</div>,
});
