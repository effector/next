import { createQuery } from "@farfetched/core";
import { createEffect } from "effector";
import * as t from "runtypes";
import { runtypeContract } from "@farfetched/runtypes";
import { faker } from "@faker-js/faker";

/**
 * In real life this would be createJsonQuery to real API
 *
 * Read more
 * https://farfetched.pages.dev/tutorial/built_in_query_factories.html#json-api
 */
export const companiesQuery = createQuery({
  name: "getCompanies",
  effect: createEffect(async () => {
    return fakeCompanies;
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
const fakeCompanies = list(() => ({
  id: faker.datatype.uuid(),
  name: faker.company.name(),
  imageLink: faker.image.business(250, 250, true),
  description: faker.company.bs(),
}));

export const catsQuery = createQuery({
  name: "getCats",
  effect: createEffect(async () => fakeCats),
  contract: runtypeContract(
    t.Array(
      t.Record({
        kind: t.String,
        imageLink: t.String,
        description: t.String,
      })
    )
  ),
});
export const getCatQuery = createQuery({
  name: "getCat",
  effect: createEffect(
    async (kind: string) => fakeCats.find((c) => c.kind === kind) ?? null
  ),
  contract: runtypeContract(
    t.Record({
      kind: t.String,
      imageLink: t.String,
      description: t.String,
    })
  ),
});
const getFakeCat = () => ({
  kind: faker.animal.cat(),
  imageLink: faker.image.cats(250, 250, true),
  description: faker.lorem.sentence(),
});
const fakeCats = list(getFakeCat);

export const productsQuery = createQuery({
  name: "getProducts",
  initialData: [],
  effect: createEffect(async () => fakeProducts),
  contract: runtypeContract(
    t.Array(
      t.Record({
        id: t.String,
        name: t.String,
        imageLink: t.String,
        description: t.String,
        price: t.String,
        category: t.String,
      })
    )
  ),
});
const getFakeProduct = () => ({
  id: faker.datatype.uuid(),
  name: faker.commerce.productName(),
  imageLink: faker.image.food(250, 250, true),
  description: faker.commerce.productDescription(),
  price: faker.commerce.price(100, 200, 0, "$"),
  category: faker.commerce.department(),
});
const fakeProducts = list(getFakeProduct);

// utils
function list<T>(cb: () => T): T[] {
  const count = Math.ceil(Math.random() * 10);

  const result = [];

  for (let i = 0; i < count + 1; i++) {
    result.push(cb());
  }

  return result;
}
