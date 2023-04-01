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

describe("getClientScope", () => {
  test("should handle server values injection on the fly", async () => {
    const serverScope = fork();

    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });
    await allSettled(up, { scope: serverScope });

    const serverValues = serialize(serverScope);

    const clientScopeOne = getClientScope();

    expect(clientScopeOne.getState($count)).toEqual(0);

    const promise = allSettled(longUpFx, { scope: clientScopeOne });

    const clientScopeTwo = getClientScope(serverValues);

    expect(clientScopeTwo.getState($count)).toEqual(3);

    await promise;

    expect(clientScopeTwo.getState($count)).toEqual(4);
  });
});
