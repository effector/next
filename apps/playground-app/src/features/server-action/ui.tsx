"use client";
import { useUnit } from "effector-react";

import { $hashedValue, $pending, valueChanged } from "./model";

export function ServerAction() {
  const [hashedValue, pending, changed] = useUnit([
    $hashedValue,
    $pending,
    valueChanged,
  ]);

  return (
    <div
      style={{
        maxWidth: "300px",
        margin: "auto",
      }}
    >
      <h3>Server action example</h3>
      <input type="text" onChange={(e) => changed(e.target.value)} />
      <div>
        Server-hashed value: {pending ? "Hashing..." : hashedValue.slice(0, 5)}
      </div>
    </div>
  );
}
