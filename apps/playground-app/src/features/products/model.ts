import { combine, createStore, sample, type StoreValue } from "effector";
import * as t from "runtypes";

import { productsQuery } from "#root/shared/api";
import { declarePage, showAlertFx } from "#root/shared/app";
import { runtypeContract } from "@farfetched/runtypes";

export const productsListPage = declarePage({
  pageType: "productsList",
});

export const $productsList = productsQuery.$data.map((list) => list ?? []);

export const productPage = declarePage({
  pageType: "product",
  contextContract: runtypeContract(t.Record({ id: t.String })),
});

type Product = StoreValue<typeof $productsList>[number];
const $currentProductId = createStore<null | Product["id"]>(null);

export const $currentProduct = combine(
  {
    list: $productsList,
    id: $currentProductId,
  },
  ({ list, id }) => {
    return list.find((product) => product.id === id) ?? null;
  }
);

sample({
  clock: [productsListPage.opened, productPage.opened],
  target: productsQuery.refresh,
});

sample({
  clock: productsQuery.finished.failure,
  fn: ({ error }) => JSON.stringify(error),
  target: showAlertFx,
});

sample({
  clock: productPage.opened,
  fn: ({ id }) => id,
  target: $currentProductId,
});
