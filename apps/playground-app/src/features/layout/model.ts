import { $isClient } from "#root/shared/app";
import { createEvent, createStore, sample } from "effector";
import { interval } from "patronum";

export const timerButtonClicked = createEvent();

const timer = interval({
  start: sample({
    clock: timerButtonClicked,
    filter: $isClient,
  }),
  timeout: 1000,
});

export const $count = createStore(0);

/**
 * Tick counter on client
 */
sample({
  clock: timer.tick,
  source: $count,
  fn: (s) => s + 1,
  target: $count,
});
