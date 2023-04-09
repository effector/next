import { combine, createStore, sample, type StoreValue } from "effector";
import * as t from "runtypes";

import { companiesQuery } from "#root/shared/api";
import { declarePage, showAlertFx } from "#root/shared/app";
import { runtypeContract } from "@farfetched/runtypes";

export const companiesListPage = declarePage({
  pageType: "companies",
});

export const $companiesList = companiesQuery.$data.map((list) => list ?? []);

export const companyPage = declarePage({
  pageType: "company",
  contextContract: runtypeContract(t.Record({ id: t.String })),
});

type Company = StoreValue<typeof $companiesList>[number];
const $currentCompanyId = createStore<null | Company["id"]>(null);

export const $currentCompany = combine(
  {
    list: $companiesList,
    id: $currentCompanyId,
  },
  ({ list, id }) => {
    return list.find((company) => company.id === id) ?? null;
  }
);

sample({
  clock: [companiesListPage.opened, companyPage.opened],
  target: companiesQuery.refresh,
});

sample({
  clock: companiesQuery.finished.failure,
  fn: ({ error }) => JSON.stringify(error),
  target: showAlertFx,
});

sample({
  clock: companyPage.opened,
  fn: ({ id }) => id,
  target: $currentCompanyId,
});
