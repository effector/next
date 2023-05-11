import { createJsonQuery, declareParams } from "@farfetched/core";
import * as t from "runtypes";
import { runtypeContract } from "@farfetched/runtypes";
import { createStore } from "effector";

const $apiBase = createStore("https://api.openbrewerydb.org/v1/breweries");

const BEER_PIC =
  "https://s.yimg.com/ny/api/res/1.2/uLAB.Akslx9DdgwD4fNKqQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQ4MA--/https://media.zenfs.com/en-US/homerun/food_wine_804/a5a30da634b1c24048f8e1dfced2b915";

const BreweryTypeContract = t.Union(
  t.Literal("micro"),
  t.Literal("nano"),
  t.Literal("regional"),
  t.Literal("brewpub"),
  t.Literal("large"),
  t.Literal("planning"),
  t.Literal("bar"),
  t.Literal("contract"),
  t.Literal("proprietor"),
  t.Literal("closed")
);

const BreweryContract = t.Record({
  id: t.String,
  name: t.String,
  brewery_type: BreweryTypeContract,
  address_1: t.String.nullable(),
  address_2: t.String.nullable(),
  address_3: t.String.nullable(),
  city: t.String.nullable(),
  state_province: t.String.nullable(),
  postal_code: t.String.nullable(),
  country: t.String.nullable(),
  longitude: t.String.nullable(),
  latitude: t.String.nullable(),
  phone: t.String.nullable(),
  website_url: t.String.nullable(),
  state: t.String.nullable(),
  street: t.String.nullable(),
});

export type Brewery = t.Static<typeof BreweryContract>;

export const getBreweriesQuery = createJsonQuery({
  name: "getBreweries",
  params: declareParams<{ page: number } | void>(),
  request: {
    method: "GET",
    url: $apiBase,
    query: (params) => ({
      per_page: params?.page ?? 1,
    }),
  },
  response: {
    contract: runtypeContract(t.Array(BreweryContract)),
    mapData: ({ result }) =>
      result.map((brewery) => ({ ...brewery, image: BEER_PIC })),
  },
});

export const getSingleBreweryQuery = createJsonQuery({
  name: "getSingleBrewery",
  params: declareParams<{ id: string }>(),
  request: {
    method: "GET",
    url: {
      source: $apiBase,
      fn: (params, base) => `${base}/${params.id}`,
    },
  },
  response: {
    contract: runtypeContract(BreweryContract),
    mapData: ({ result }) => ({
      ...result,
      image: BEER_PIC,
    }),
  },
});

export const getBreweryOfTheDayQuery = createJsonQuery({
  name: "getBreweryOfTheDay",
  request: {
    method: "GET",
    url: {
      source: $apiBase,
      fn: (_params, base) => `${base}/random`,
    },
  },
  response: {
    contract: runtypeContract(t.Array(BreweryContract)),
    mapData: ({ result }) =>
      result.map((brewery) => ({ ...brewery, image: BEER_PIC }))[0],
  },
});
