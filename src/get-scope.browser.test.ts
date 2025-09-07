// @vitest-environment happy-dom

import { describe, test, expect, vi, afterEach } from "vitest";
import {
  createStore,
  createEvent,
  createEffect,
  fork,
  serialize,
  allSettled,
  combine,
  sample,
  createWatch,
} from "effector";

import { getScope, PRIVATE_resetCurrentScope } from "./get-scope";

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
  afterEach(() => {
    PRIVATE_resetCurrentScope();
  });
  test("should handle server values injection on the fly", async () => {
    const serverScope = fork();

    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });

    const serverValues = serialize(serverScope);

    const clientScopeOne = getScope();

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

    const clientScopeTwo = getScope(serverValues);

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
  /**
   * Current fix for this test is only implemented inside `effector-react@22.5.4`
   *
   * TODO: After fix is ported into original createWatch of `effector` package in the 23.0.0 release, remove skip
   */
  test.skip("watchers should re-run, if value is changed after server values injection", async () => {
    const watcherCalled = vi.fn(); // Imitates useUnit and stuff

    const scope = getScope({
      [`${$count.sid}`]: 0,
    });

    const unwatch = createWatch({
      unit: $count,
      scope,
      fn: watcherCalled,
    });

    expect(scope.getState($count)).toEqual(0);
    expect(watcherCalled).toHaveBeenCalledTimes(0);

    const scopeTwo = getScope({
      [`${$count.sid}`]: 1,
    });

    expect(scopeTwo.getState($count)).toEqual(1);
    expect(watcherCalled).toHaveBeenCalledTimes(1);

    const scopeThree = getScope({
      [`${$count.sid}`]: 1,
    });

    expect(scopeThree.getState($count)).toEqual(1);
    expect(watcherCalled).toHaveBeenCalledTimes(1);

    unwatch();
  });
  test("shallow navigation to same page", async () => {
    const serverScope = fork();

    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });

    const values = serialize(serverScope);

    const clientScopeOne = getScope(values);

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
    const clientScopeTwo = getScope(values);

    expect(clientScopeTwo.getState($count)).toEqual(4);
  });

  test("should support custom serializers", async () => {
    const $homeDate = createStore<Date | null>(null, {
      serialize: {
        read: (dateStringOrNull) =>
          typeof dateStringOrNull === "string"
            ? new Date(dateStringOrNull)
            : null,
        write: (dateOrNull) => (dateOrNull ? dateOrNull.toISOString() : null),
      },
      sid: "test_sid",
    });

    const serverScope = fork();

    await allSettled($homeDate, {
      scope: serverScope,
      params: new Date(2024, 10, 3),
    });

    const values = serialize(serverScope);

    const scope = getScope(values);

    const clientValue = scope.getState($homeDate);

    expect(clientValue instanceof Date).toBe(true);
    expect(clientValue!.getTime()).toEqual(new Date(2024, 10, 3).getTime());
  });
});

describe("getScope implementation details", () => {
  test("should return same scope on client every time", () => {
    /**
     * Implementation detail that may change in the future
     */
    const scopeOne = getScope();
    const scopeTwo = getScope();

    expect(scopeOne === scopeTwo).toBe(true);
  });
});
