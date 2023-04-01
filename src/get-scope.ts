import { fork, Scope, serialize } from "effector";

type Values = Record<string, unknown>;
export const getScope =
  typeof window !== "undefined" ? getClientScope : getServerScope;

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

/**
 * The following code is some VERY VERY VERY BAD HACKS.
 *
 * This only work for a compatibility layer with Next.js and only because of the peculiarities of Next.js behavior.
 *
 * This temporary solution on hacks allows us to solve the pain of library users when working with Next.js, as well as gather much more information to develop a better API.
 */

function getServerScope(values?: Values) {
  return fork({ values });
}

function HACK_injectValues(scope: Scope, values: Values) {
  const oldValues = serialize(scope);

  // @ts-expect-error this is a really hacky way to "hydrate" scope
  scope.sidValuesMap = {
    ...oldValues,
    ...values,
  };
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
