import { createElement, ReactNode } from "react";
import { Provider } from "effector-react";

import { getScope, getClientScope } from "./get-scope";

/**
 * Effector Scope provider. Handles effector state hydration under the hood.
 */
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

export {
  getClientScope
}
