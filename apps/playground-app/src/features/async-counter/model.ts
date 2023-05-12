import { sleep } from "#root/shared/lib/sleep";
import { createEvent, createStore, createEffect, sample } from "effector";

export const buttonClicked = createEvent();
export const $counter = createStore(0).on(buttonClicked, (state) => state + 1);

const timerFx = createEffect(() => sleep(1_000));

export const $timerTicking = createStore(false).on(buttonClicked, (s) => !s);

sample({
  clock: buttonClicked,
  target: timerFx,
});

sample({
  clock: timerFx.done,
  filter: $timerTicking,
  target: timerFx,
});

sample({
  clock: timerFx.done,
  source: $counter,
  fn: (s) => s + 1,
  target: $counter,
});
