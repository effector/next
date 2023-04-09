"use client";

import Image from "next/image";
import { reflect, list, variant } from "@effector/reflect";
import { StoreValue } from "effector";
import { useUnit } from "effector-react";
import Link from "next/link";

import { $companiesList, $currentCompany } from "./model";

export const Companies = () => {
  return (
    <div>
      <h1>Companies</h1>
      <ul>
        <CompaniesList />
      </ul>
    </div>
  );
};

export const CompanyDetails = () => {
  const company = useUnit($currentCompany);

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div>
      <h1>Company Details</h1>
      <h2>{company.name}</h2>
      <Image src={company.imageLink} alt={company.name} />
      <p>{company.description}</p>
    </div>
  );
};

const CompanyItem = reflect({
  view: ({
    id,
    name,
    imageLink,
    description,
  }: StoreValue<typeof $companiesList>[number]) => (
    <li>
      <h2>{name}</h2>
      <Image src={imageLink} alt={name} width={250} height={250} />
      <p>{description}</p>
      <div>
        <Link href={`/companies/${id}`}>Details</Link>
      </div>
      <div>
        <Link href={`/app-companies/${id}`}>Details (App directory)</Link>
      </div>
    </li>
  ),
  bind: {},
});

const CompaniesList = variant({
  if: $companiesList.map((list) => list.length > 0),
  then: list({
    view: CompanyItem,
    source: $companiesList,
    getKey: (item) => item.id,
  }),
  else: () => <div>No companies loaded</div>,
});
