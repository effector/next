import { combine, createStore, sample, type StoreValue } from "effector";
import * as t from "runtypes";

import { catsQuery, getCatQuery } from "#root/shared/api";
import { declarePage, showAlertFx } from "#root/shared/app";
import { runtypeContract } from "@farfetched/runtypes";

export const catsListPage = declarePage({
  pageType: "cats",
});

export const $catsList = catsQuery.$data.map((list) => list ?? []);

/**
 * Exported for getStatisPaths
 *
 * Defining it in the model allows us encapsulate the logic of getting the list of ids
 *
 * In this case it is a simple map, but it could be a more complex logic for sure
 */
export const $catKinds = $catsList.map((list) => list.map((cat) => cat.kind));

export const catPage = declarePage({
  pageType: "cat",
  contextContract: runtypeContract(t.Record({ id: t.String })),
});

export const $currentCat = getCatQuery.$data;

sample({
  clock: [catsListPage.opened, catPage.opened],
  target: catsQuery.refresh,
});

sample({
  clock: catsQuery.finished.failure,
  fn: ({ error }) => JSON.stringify(error),
  target: showAlertFx,
});

sample({
  clock: catPage.opened,
  fn: ({ id }) => id,
  target: getCatQuery.refresh,
});
