import { fork, type Scope, type createStore, type Json } from "effector";

type Values = Record<string, unknown>;
const isClient = typeof document !== "undefined";
export const getScope = isClient ? internalGetClientScope : getServerScope;

function getServerScope(values?: Values) {
  return fork({ values });
}

/**
 *
 * Handler to get current client scope.
 *
 * Required for proper integrations with dev-tools.
 *
 * @returns current client scope in browser and null in server environment
 */
export function getClientScope() {
  if (isClient) {
    return _currentScope;
  }

  return null;
}

/**
 * The following code is some VERY VERY VERY BAD HACKS.
 *
 * This only work for a compatibility layer with Next.js and only because of the peculiarities of Next.js behavior.
 *
 * This temporary solution on hacks allows us to solve the pain of library users when working with Next.js, as well as gather much more information to develop a better API.
 */
const _currentScope: Scope = fork();
let prevValues: Values;
/**
 * @private
 *
 * exported for tests only
 */
export function internalGetClientScope(values?: Values) {
  if (
    !values ||
    /**
     * This is a hack to handle edge cases with shallow navigation
     *
     * In this case Next.js will basically re-use old pageProps,
     * but we already have latest state in the client scope
     *
     * So this update is just skipped
     */
    values === prevValues
  )
    return _currentScope;

  /**
   * Saving previous values to handle edge cases with shallow navigation
   */
  prevValues = values;

  HACK_injectValues(_currentScope, values);
  HACK_updateScopeRefs(_currentScope, values);

  return _currentScope;
}

function HACK_injectValues(scope: Scope, values: Values) {
  // @ts-expect-error this is a really hacky way to "hydrate" scope
  Object.assign(scope.values.sidMap, values);
}

function HACK_updateScopeRefs(scope: Scope, values: Values) {
  // @ts-expect-error
  for (const id in scope.reg) {
    // @ts-expect-error
    if (Object.hasOwnProperty.call(scope.reg, id)) {
      // @ts-expect-error
      const ref = scope.reg[id];
      if (!ref.meta || (!ref.meta?.named && ref.meta?.derived)) {
        /**
         * Force recalculation of derived values
         */
        // @ts-expect-error
        delete scope.reg[id];
      } else {
        /**
         * Update non-derived values
         */
        const sid = ref?.meta?.sid;
        if (sid && sid in values) {
          const serialize = ref?.meta?.serialize as StoreSerializationConfig;
          const read =
            serialize && serialize !== "ignore" ? serialize?.read : null;
          ref.current = read ? read(values[sid] as Json) : values[sid];
        }
      }
    }
  }
}

// types for convenience
type StoreSerializationConfig = Exclude<Parameters<typeof createStore>[1], undefined>["serialize"];
