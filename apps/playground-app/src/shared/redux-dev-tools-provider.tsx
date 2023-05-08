"use client";

import { getClientScope } from "@effector/next";
import { attachReduxDevTools } from "@effector/redux-devtools-adapter";

const clientScope = getClientScope();

if (clientScope) {
  /**
   * Notice, that we need to check for the client scope first
   *
   * It will be `null` at the server
   */
  attachReduxDevTools({
    scope: clientScope,
    name: "playground-app-app-router",
    trace: true,
  });
}

export function ReduxDevToolsAdapter({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <>{children}</>;
}
