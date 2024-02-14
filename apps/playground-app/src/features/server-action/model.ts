import { createEffect, createEvent, createStore, sample } from "effector";
import { debounce } from "patronum";

import { hashValue } from "./hash-value";

const hashValueFx = createEffect(async (value: string) => hashValue(value));

export const $hashedValue = createStore<string>("").on(
  hashValueFx.doneData,
  (_, value) => value
);

export const $pending = hashValueFx.pending;

export const valueChanged = createEvent<string>();

sample({
  clock: debounce(valueChanged, 500),
  target: hashValueFx,
});
