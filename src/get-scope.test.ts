import { describe, test, expect } from "vitest";
import {
  createStore,
  createEvent,
  createEffect,
  fork,
  serialize,
  allSettled,
  combine,
  sample,
} from "effector";

import { getClientScope } from "./get-scope";

const up = createEvent();
const longUpFx = createEffect(async () => {
  await new Promise((r) => setTimeout(r, 10));
});
const $count = createStore(0).on([up, longUpFx.done], (s) => s + 1);
const $derived = $count.map((s) => ({ ref: s }));
const $combined = combine({ ref: $count });
const $nestedCombined = combine({ ref: $derived });

const $sampled = sample({
  source: { ref: $combined },
  fn: (ref) => ref.ref.ref,
});

const getFixedDate = () => new Date(0);
const updateDate = createEvent<Date>();
const $specialData = createStore(getFixedDate(), {
  serialize: {
    write: (_date) => ({ lol: "jsonified view" }),
    read: (_json) => getFixedDate(),
  },
}).on($count, () => getFixedDate());

describe("getClientScope", () => {
  test("should handle server values injection on the fly", async () => {
    const serverScope = fork();

    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });

    const serverValues = serialize(serverScope);

    const clientScopeOne = getClientScope();

    expect(clientScopeOne.getState($count)).toEqual(0);
    expect(clientScopeOne.getState($derived)).toEqual({ ref: 0 });
    expect(clientScopeOne.getState($combined)).toEqual({ ref: 0 });
    expect(clientScopeOne.getState($nestedCombined)).toEqual({
      ref: { ref: 0 },
    });
    expect(clientScopeOne.getState($sampled)).toEqual(0);
    expect(clientScopeOne.getState(longUpFx.pending)).toEqual(false);
    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(0);
    expect(clientScopeOne.getState($specialData)).toEqual(getFixedDate());

    const promise = allSettled(longUpFx, { scope: clientScopeOne });

    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(1);

    const clientScopeTwo = getClientScope(serverValues);

    expect(clientScopeTwo.getState($count)).toEqual(3);
    expect(clientScopeOne.getState($derived)).toEqual({ ref: 3 });
    expect(clientScopeOne.getState($combined)).toEqual({ ref: 3 });
    expect(clientScopeOne.getState($nestedCombined)).toEqual({
      ref: { ref: 3 },
    });
    expect(clientScopeOne.getState($sampled)).toEqual(3);
    expect(clientScopeOne.getState(longUpFx.pending)).toEqual(true);
    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(1);
    expect(clientScopeOne.getState($specialData)).toEqual(getFixedDate());

    await promise;

    expect(clientScopeTwo.getState($count)).toEqual(4);
    expect(clientScopeOne.getState($derived)).toEqual({ ref: 4 });
    expect(clientScopeOne.getState($combined)).toEqual({ ref: 4 });
    expect(clientScopeOne.getState($nestedCombined)).toEqual({
      ref: { ref: 4 },
    });
    expect(clientScopeOne.getState($sampled)).toEqual(4);
    expect(clientScopeOne.getState(longUpFx.pending)).toEqual(false);
    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(0);
    expect(clientScopeOne.getState($specialData)).toEqual(getFixedDate());
  });
  test("shallow navigation to same page", async () => {
    const serverScope = fork();

    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });

    const values = serialize(serverScope);

    const clientScopeOne = getClientScope(values);

    expect(clientScopeOne.getState($count)).toEqual(3);

    await allSettled(up, { scope: clientScopeOne });

    expect(clientScopeOne.getState($count)).toEqual(4);

    // This imitates shallow navigation to same page, e.g. with different query params
    //
    // Next.js will reuse the same pageProps instance in this case
    // which will basically override current page state with initial one
    //
    // So we need to basically just ignore it, because
    // we already have the latest state in the client scope
    const clientScopeTwo = getClientScope(values);

    expect(clientScopeTwo.getState($count)).toEqual(4);
  });
});
