import { StoreValue, createEvent, createStore, sample, split } from "effector";

import {
  Brewery,
  getBreweriesQuery,
  getSingleBreweryQuery,
} from "#root/shared/api";
import { declarePage } from "#root/shared/app";

export const breweriesFeatureStarted = createEvent();
export const moreRequested = createEvent();

const $currentPage = createStore<number>(1);
export const $list = createStore<Brewery[]>([]);

$list.on(getBreweriesQuery.finished.success, (list, { result }) => [
  ...list,
  ...result,
]);

export const $pending = getBreweriesQuery.$pending;

const nextPageRequested = createEvent();

sample({
  clock: moreRequested,
  source: $currentPage,
  fn: (page) => page + 1,
  target: [$currentPage, nextPageRequested],
});

sample({
  clock: [breweriesFeatureStarted, nextPageRequested],
  source: $currentPage,
  fn: (page) => ({ page }),
  target: getBreweriesQuery.refresh,
});

const $currentBreweryId = createStore<string | null>(null);
export const $currentBrewery = createStore<Brewery | null>(null);

export const $singlePending = getSingleBreweryQuery.$pending;

export const singleRequested = createEvent<string>();

$currentBreweryId.on(singleRequested, (_, id) => id);

const breweryLoaded = createEvent<Brewery>();
const breweryNotFound = createEvent<null>();

split({
  source: sample({
    clock: singleRequested,
    source: $list,
    fn: (list, id) => list.find((item) => item.id === id) ?? null,
  }),
  match: {
    found: (brewery) => brewery !== null,
  },
  cases: {
    found: breweryLoaded,
    __: breweryNotFound,
  },
});

sample({
  clock: breweryNotFound,
  source: $currentBreweryId,
  /**
   * There is a edge-case with TypeScript type inference here,
   * which requires to explicitly set the `filter` argument type to _make type narrowing work_
   * - even though TypeScript _knowns_ the type and _will not_ allow to set it to the wrong value.
   *
   * You can read about it in detail here:
   * https://effector.dev/docs/typescript/typing-effector#sample
   */
  filter: (id: StoreValue<typeof $currentBreweryId>): id is string =>
    id !== null,
  fn: (id) => ({ id }),
  target: getSingleBreweryQuery.refresh,
});

sample({
  clock: [breweryLoaded, getSingleBreweryQuery.$data],
  target: $currentBrewery,
});

export const breweryPage = declarePage<{ id: string }>({
  pageType: "brewery",
});

sample({
  clock: breweryPage.open,
  fn: ({ id }) => id,
  target: singleRequested,
});
