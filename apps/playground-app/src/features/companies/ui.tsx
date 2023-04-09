"use client";

import { reflect, list, variant } from "@effector/reflect";
import { StoreValue } from "effector";

import { $companiesList } from "./model";

export const Companies = () => {
  return (
    <div>
      <h1>Companies</h1>
      <CompaniesList />
    </div>
  );
};

const Company = reflect({
  view: ({
    name,
    imageLink,
    description,
  }: StoreValue<typeof $companiesList>[number]) => (
    <li>
      <h2>{name}</h2>
      <img src={imageLink} alt={name} />
      <p>{description}</p>
    </li>
  ),
  bind: {},
});

const CompaniesList = variant({
  if: $companiesList.map((list) => list.length > 0),
  then: list({
    view: Company,
    source: $companiesList,
    getKey: (item) => item.id,
  }),
  else: () => <div>No companies loaded</div>
});
