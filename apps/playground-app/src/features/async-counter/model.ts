import { sleep } from '#root/shared/lib/sleep'
import { createEffect, createEvent, createStore, sample } from 'effector'

export const buttonClicked = createEvent()
export const counterInit = createEvent()
export const $counter = createStore(0).on(buttonClicked, (state) => state + 1)

const logFx = createEffect((val: number) => console.log('logFx ->', val))

sample({
  clock: counterInit,
  source: $counter,
  fn: (source) => source,
  target: logFx
});


const eventInEffect = createEvent()
sample({
  clock: eventInEffect,
  source: $counter,
  fn: (source) => {
    console.log('eventInEffect ->', source)
    return source
  },
  target: logFx
})

export const btnClicked = createEvent()

const btnClickedFx = createEffect(async() => {
  await sleep(2_000)
  eventInEffect()
})

sample({clock: btnClicked, target: btnClickedFx})


const timerFx = createEffect(() => sleep(1_000));





export const $timerTicking = createStore(false).on(buttonClicked, (s) => !s)

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
