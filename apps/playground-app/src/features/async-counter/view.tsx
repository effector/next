"use client";

import { useUnit } from "effector-react";
import { Button } from "#root/shared/ui";
import { buttonClicked, $counter, $timerTicking, counterInit } from './model'
import { useEffect } from 'react'

export function AsyncCounter() {
  const click = useUnit(buttonClicked);
  const { counter, ticking } = useUnit({
    counter: $counter,
    ticking: $timerTicking,
  });


  console.log('view', {counter})
  return (
    <Button onClick={() => click()}>
      Count: {counter} ({ticking ? "ticking" : "idle"})
    </Button>
  );
}
