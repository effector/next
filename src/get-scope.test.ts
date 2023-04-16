import { describe, test, expect } from "vitest";
import {
  createStore,
  createEvent,
  createEffect,
  fork,
  serialize,
  allSettled,
  sample,
} from "effector";

import { getClientScope } from "./get-scope";

const up = createEvent();
const longUpFx = createEffect(async () => {
  await new Promise((r) => setTimeout(r, 10));
});
const $count = createStore(0, { sid: "$count" }).on(
  [up, longUpFx.done],
  (s) => s + 1
);
const $derived = $count.map((s) => ({ ref: s }));

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
    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(0);

    const promise = allSettled(longUpFx, { scope: clientScopeOne });

    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(1);

    const clientScopeTwo = getClientScope(serverValues);

    expect(clientScopeTwo.getState($count)).toEqual(3);
    expect(clientScopeOne.getState($derived)).toEqual({ ref: 3 });
    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(1);

    await promise;

    expect(clientScopeTwo.getState($count)).toEqual(4);
    expect(clientScopeOne.getState($derived)).toEqual({ ref: 4 });
    expect(clientScopeOne.getState(longUpFx.inFlight)).toEqual(0);
  });
});
