import { fork, Scope, serialize } from "effector";

type Values = Record<string, unknown>;
export const getScope =
  typeof document !== "undefined" ? getClientScope : getServerScope;

function getServerScope(values?: Values) {
  return fork({ values });
}

/**
 * The following code is some VERY VERY VERY BAD HACKS.
 *
 * This only work for a compatibility layer with Next.js and only because of the peculiarities of Next.js behavior.
 *
 * This temporary solution on hacks allows us to solve the pain of library users when working with Next.js, as well as gather much more information to develop a better API.
 */
const _currentScope: Scope = fork();
/**
 * @private
 *
 * exported for tests only
 */
export function getClientScope(values?: Values) {
  if (!values) return _currentScope;

  HACK_injectValues(_currentScope, values);
  HACK_updateScopeRefs(_currentScope, values);

  return _currentScope;
}

function HACK_injectValues(scope: Scope, values: Values) {
  const oldValues = serialize(scope);

  // @ts-expect-error this is a really hacky way to "hydrate" scope
  scope.values.sidMap = {
    ...oldValues,
    ...values,
  };
}

function HACK_updateScopeRefs(scope: Scope, values: Values) {
  const idSidMap = Object.fromEntries(
    // @ts-expect-error
    Object.entries(scope.sidIdMap).map(([sid, id]) => [id, sid])
  );

  // @ts-expect-error
  for (const id in scope.reg) {
    // @ts-expect-error
    const ref = scope.reg[id];
    if (!ref.meta || ref.meta?.derived) {
      /**
       * Force recalculation of derived values
       */
      // @ts-expect-error
      delete scope.reg[id];
    } else {
      /**
       * Update non-derived values
       */
      const sid = idSidMap[id];
      if (sid && sid in values) {
        ref.current = values[sid];
      }
    }
  }
}
