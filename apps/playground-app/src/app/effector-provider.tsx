"use client";

import type { ComponentProps } from "react";
import { EffectorNext } from "@effector/next"

export function EffectorAppNext({
  values,
  children,
}: ComponentProps<typeof EffectorNext>) {
  return <EffectorNext values={values}>{children}</EffectorNext>;
}
