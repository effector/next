"use client";

import { createElement, ReactNode } from "react";
import { Provider } from "effector-react";

import { getScope } from "./get-scope";

export function EffectorNext({
  values,
  children,
}: {
  values?: Record<string, unknown>;
  children: ReactNode;
}) {
  const scope = getScope(values);

  return createElement(Provider, { value: scope }, children);
}
