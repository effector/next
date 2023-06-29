'use client'
import { useUnit } from 'effector-react'
import { btnClicked } from '#root/features/async-counter/model'

export const TestBtn = () => {

  const clicked = useUnit(btnClicked)
  return (
    <button onClick={() => clicked()}>Click me</button>
  )
}
