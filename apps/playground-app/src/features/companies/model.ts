import { sample } from "effector";

import { companiesQuery } from "#root/shared/api";
import { declarePage, showAlertFx } from "#root/shared/app";

export const companiesPage = declarePage({
  pageType: "companies",
});

export const $companiesList = companiesQuery.$data.map((list) => list ?? []);

sample({
  clock: companiesPage.opened,
  target: companiesQuery.refresh,
});

sample({
  clock: companiesQuery.finished.failure,
  fn: ({ error }) => JSON.stringify(error),
  target: showAlertFx,
});
