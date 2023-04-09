"use client";

import type { ComponentProps } from "react";
import { EffectorNext } from "@effector/next";

export function EffectorAppNext({
  values,
  children,
}: ComponentProps<typeof EffectorNext>) {
  return <EffectorNext values={values}>{children}</EffectorNext>;
}

/**
 * New app directory considers all components as Server Components by default.
 *
 * Because of that EffectorNext provider won't work as it is, as it uses client-only createContext API internally - you will immoderately get a compile error in Next.js
 *
 * The official way to handle this - is to re-export such components as modules with "use client" directive.
 *
 * To do so, create effector-provider.tsx file at the top level of your app directory, which re-exports EffectorNext provider as a "use client" module
 *
 * This version of EffectorNext should be used everywhere in the app dir
 */
