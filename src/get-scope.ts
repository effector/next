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
  HACK_resetScopeRefs(_currentScope);

  return _currentScope;
}

function HACK_injectValues(scope: Scope, values: Values) {
  const oldValues = serialize(scope);

  // @ts-expect-error this is a really hacky way to "hydrate" scope
  if (scope.values) {
    /**
     * effector@22.8.0 and higher
     */
    // @ts-expect-error
    scope.values.sidMap = {
      ...oldValues,
      ...values,
    }
  } else {
    /**
     * effector before 22.8.0
     */
    // @ts-expect-error this is a really hacky way to "hydrate" scope
    scope.sidValuesMap = {
      ...oldValues,
      ...values,
    };
  }
}

function HACK_resetScopeRefs(scope: Scope) {
  /**
   * Kind of equal to proposed fork(scope) behaviour
   */
  // @ts-expect-error hacky way to reset state refs owned by this scope
  scope.reg = {};
  // @ts-expect-error hacky way to reset state refs owned by this scope
  scope.sidIdMap = {};
}
