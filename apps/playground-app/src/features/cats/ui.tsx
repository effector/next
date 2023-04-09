"use client";

import { reflect, list, variant } from "@effector/reflect";
import { StoreValue } from "effector";
import { useUnit } from "effector-react";
import Link from "next/link";

import { $catsList, $currentCat } from "./model";

export const Cats = () => {
  return (
    <div>
      <h1>Cats</h1>
      <CatsList />
    </div>
  );
};

export const CatDetails = () => {
  const cat = useUnit($currentCat);

  if (!cat) {
    return <div>Cat not found</div>;
  }

  return (
    <div>
      <h1>Cat Details</h1>
      <h2>{cat.kind}</h2>
      <img src={cat.imageLink} alt={cat.kind} />
      <p>{cat.description}</p>
    </div>
  );
};

const CatItem = reflect({
  view: ({
    kind,
    imageLink,
    description,
  }: StoreValue<typeof $catsList>[number]) => (
    <li>
      <h2>{kind}</h2>
      <img src={imageLink} alt={kind} />
      <p>{description}</p>
      <Link href={`/cats/${kind}`}>Details</Link>
    </li>
  ),
  bind: {},
});

const CatsList = variant({
  if: $catsList.map((list) => list.length > 0),
  then: list({
    view: CatItem,
    source: $catsList,
  }),
  else: () => <div>No cats loaded</div>,
});
