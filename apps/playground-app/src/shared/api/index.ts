import { createQuery, cache, inMemoryCache } from "@farfetched/core";
import { createEffect } from "effector";
import * as t from "runtypes";
import { runtypeContract } from "@farfetched/runtypes";
import { faker } from "@faker-js/faker";

/**
 * In real life this would be createJsonQuery to real API
 */
export const companiesQuery = createQuery({
  name: "getCompanies",
  effect: createEffect(async () => {
    const result = list(() => ({
      id: faker.datatype.uuid(),
      name: faker.company.name(),
      imageLink: faker.image.business(),
      description: faker.company.bs(),
    }));

    return result;
  }),
  contract: runtypeContract(
    t.Array(
      t.Record({
        id: t.String,
        name: t.String,
        imageLink: t.String,
        description: t.String,
      })
    )
  ),
});

cache(companiesQuery, {
  // perist data in cache
  // so we are not making requests on every page open on the server
  adapter: inMemoryCache(),
  staleAfter: "2min",
});

// utils
function list<T>(cb: () => T): T[] {
  const count = Math.ceil(Math.random() * 10);

  const result = [];

  for (let i = 0; i < count + 1; i++) {
    result.push(cb());
  }

  return result;
}
