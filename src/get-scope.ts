import {
  fork,
  type Scope,
  type createStore,
  type Json,
  Node,
  launch,
  StateRef,
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

  return _currentScope;
}

function HACK_injectValues(scope: Scope, values: Values) {
  // @ts-expect-error this is a really hacky way to "hydrate" scope
  Object.assign(scope.values.sidMap, values);
}

function HACK_updateScopeRefs(tscope: Scope, values: Values) {
  const scope = tscope as ScopeInternal;

  const linksToRun: [string, string, unknown][] = [];

  for (const id in scope.reg) {
    if (Object.hasOwnProperty.call(scope.reg, id)) {
      const ref = scope.reg[id];

      /**
       * Schedule external watchers (useUnit, etc) re-run
       */
      const nodeId = ref?.meta?.id;

      if (nodeId && scope.additionalLinks[nodeId]) {
        linksToRun.push([nodeId, ref.id, ref.current]);
      }

      if (!ref.meta || (!ref.meta?.named && ref.meta?.derived)) {
        /**
         * Force recalculation of derived values
         */
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

  /**
   * Run scheduled watchers
   */
  if (linksToRun.length) {
    linksToRun.forEach(([nodeId, refId, oldValue]) => {
      const newValue = scope.reg[refId].current;

      /**
      * Skip if value was not changed
       */
      if (newValue === oldValue) return;

      const links = scope.additionalLinks[nodeId];

      if (links) {
        links.forEach((link) => {
          launch({
            target: link,
            params: newValue,
            scope,
          });
        });
      }
    })
  }
}

// types for convenience
type StoreSerializationConfig = Exclude<
  Parameters<typeof createStore>[1],
  undefined
>["serialize"];

type ScopeInternal = Scope & {
  reg: Record<string, StateRef & { meta?: Record<string, string> }>;
  additionalLinks: Record<string, Node[]>;
};

// for library testing purposes
export function PRIVATE_resetCurrentScope() {
  _currentScope = fork();
}
