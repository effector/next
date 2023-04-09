'use client'

import { useUnit } from "effector-react";
import Link from "next/link";
import { ReactNode } from "react";

import { timerButtonClicked, $count } from "./model";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <nav>
        <ul>
          <li>
            <Link href="/pages-root">Main page</Link>
          </li>
          <li>
            <Link href="/companies">List of companies</Link>
          </li>
        </ul>
        <CounterButton />
      </nav>
      <div>{children}</div>
    </main>
  );
};

export const CounterButton = () => {
  const { clickTimerButton, currentCount } = useUnit({
    currentCount: $count,
    clickTimerButton: timerButtonClicked,
  });

  return (
    <button onClick={clickTimerButton}>Current count: {currentCount}</button>
  );
};
