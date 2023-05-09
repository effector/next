import { createJsonQuery, declareParams } from "@farfetched/core";
import * as t from "runtypes";
import { runtypeContract } from "@farfetched/runtypes";

import { $isClient } from "#root/shared/app";

const $apiBase = $isClient.map((isClient) =>
  isClient
    ? ""
    : process.env.VERCEL_URL
    ? `http://${process.env.VERCEL_URL}`
    : "http://localhost:3000"
);

export const companiesQuery = createJsonQuery({
  name: "getCompanies",
  request: {
    method: "GET",
    url: {
      source: $apiBase,
      fn: (_, apiBase) => `${apiBase}/api/companies`,
    },
  },
  response: {
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
  },
});

export const catsQuery = createJsonQuery({
  name: "getCats",
  request: {
    method: "GET",
    url: {
      source: $apiBase,
      fn: (_, apiBase) => `${apiBase}/api/cats`,
    },
  },
  response: {
    contract: runtypeContract(
      t.Array(
        t.Record({
          kind: t.String,
          imageLink: t.String,
          description: t.String,
        })
      )
    ),
  },
});
export const getCatQuery = createJsonQuery({
  name: "getCat",
  params: declareParams<string>(),
  request: {
    method: "GET",
    url: {
      source: $apiBase,
      fn: (kind, apiBase) => `${apiBase}/api/cats/${kind}`,
    },
  },
  response: {
    contract: runtypeContract(
      t.Record({
        kind: t.String,
        imageLink: t.String,
        description: t.String,
      })
    ),
  },
});

export const productsQuery = createJsonQuery({
  name: "getProducts",
  initialData: [],
  request: {
    method: "GET",
    url: {
      source: $apiBase,
      fn: (_, apiBase) => `${apiBase}/api/products`,
    },
  },
  response: {
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
  },
});
