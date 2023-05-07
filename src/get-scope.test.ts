import { describe, test, expect } from "vitest";

import { getScope } from "./get-scope";

describe('getScope implementation details', () => {
  test('should return new scope on server every time', () => {
    /**
     * Implementation detail that may change in the future
     */
    const scopeOne = getScope();
    const scopeTwo = getScope();

    expect(scopeOne !== scopeTwo).toBe(true);
  })
})
