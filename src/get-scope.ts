import {
  fork,
  type Scope,
  type createStore,
  type Json,
  Node,
  launch,
} from "effector";

type Values = Record<string, unknown>;
const isClient = typeof document !== "undefined";
export const getScope = isClient ? INTERNAL_getClientScope : getServerScope;

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
let _currentScope: Scope = fork();
let prevValues: Values;
/**
 * @private
 *
 * Should not be exported to the public API
 */
function INTERNAL_getClientScope(values?: Values) {
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
  HACK_runScopeLinks(_currentScope);

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

function HACK_runScopeLinks(tscope: Scope) {
  const scope = tscope as any;
  const currentValues = {} as Record<string, any>;

  Object.values(scope.reg).forEach((ref: any) => {
    if (ref?.meta?.op === "store") {
      const storeId = ref.meta.id;
      currentValues[storeId] = ref.current;
    }
  });

  Object.entries(scope.additionalLinks).forEach(([id, links]: any) => {
    links.forEach((link: Node) => {
      launch({
        scope: scope,
        target: link,
        params: currentValues[id],
      });
    });
  });
}

// types for convenience
type StoreSerializationConfig = Exclude<
  Parameters<typeof createStore>[1],
  undefined
>["serialize"];

// for library testing purposes
export function PRIVATE_resetCurrentScope() {
  _currentScope = fork();
}
