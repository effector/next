# Bindings for Next.js

This is minimal compatibility layer for effector + Next.js - it only provides one special `EffectorNext` provider component, which allows to fully leverage effector's Fork API, while handling some _special_ parts of Next.js SSR and SSG flow.

So far there are no plans to extend the API, e.g., towards better DX - there are already packages like [`nextjs-effector`](https://github.com/risenforces/nextjs-effector).
This package aims only at technical nuances.

## Installation

```bash
npm add effector effector-react @effector/next
```

Also, you can use Yarn or **PNPM** to install dependencies.

## Usage

### SIDs

To serialize and transfer state of effector stores between the network boundaries all stores must have a Stable IDentifier - sid.

Sid's are added automatically via either built-in babel plugin or our experimental SWC plugin.

#### Babel-plugin

```json
{
  "presets": ["next/babel"],
  "plugins": ["effector/babel-plugin"]
}
```

[Read the docs](https://effector.dev/docs/api/effector/babel-plugin/#usage)

#### SWC Plugin

[Read effector SWC plugin documentation](https://github.com/effector/swc-plugin)

### Pages directory

#### 1. EffectorNext provider setup

Add provider to the `pages/_app.tsx` and provide it with server-side `values`

```tsx
import { EffectorNext } from "@effector/next";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main>
      <EffectorNext values={pageProps.values}>
        <Layout>
          <Component />
        </Layout>
      </EffectorNext>
    </main>
  );
}
```

Notice, that `EffectorNext` should get serialized scope values via props.

#### 2. Server-side computations

Start your computations in server handlers using Fork API

```ts
import { fork, allSettled, serialize } from "effector";

import { pageStarted } from "../src/my-page-model";

export async function getStaticProps() {
  const scope = fork();

  await allSettled(pageStarted, { scope, params });

  return {
    props: {
      // notice serialized effector's scope here!
      values: serialize(scope),
    },
  };
}
```

Notice, that serialized scope values are provided via the same page prop, which is used in the `_app` for values in `EffectorNext`.

You're all set. Just use effector's units anywhere in components code via `useUnit` from `effector-react`.

## App directory

#### 1. Setup provider in the Root Layout

To use client components with effector units anywhere in the tree - add `EffectorNext` provider at your [Root Layout](https://beta.nextjs.org/docs/routing/pages-and-layouts#root-layout-required)

If you are using [multiple Root Layouts](https://beta.nextjs.org/docs/routing/defining-routes#example-creating-multiple-root-layouts) - each one of them should also have the `EffectorNext` provider.

```tsx
// app/layout.tsx
import { EffectorNext } from "@effector/next";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EffectorNext>{/* rest of the components tree */}</EffectorNext>
      </body>
    </html>
  );
}
```

#### 2. Server-side computations

Server computations work in a similiar way to `pages` directory, but inside Server Components of the `app` pages.

In this case you will need to add the `EffectorNext` provider to the tree of this Server Component and provide it with serialized scope.

```tsx
// app/some-path/page.tsx
import { EffectorNext } from "@effector/next";

export default async function Page() {
  const scope = fork();

  await allSettled(pageStarted, { scope, params });

  const values = serialize(scope);

  return (
    <EffectorNext values={values}>
      {/* rest of the components tree */}
    </EffectorNext>
  );
}
```

This will automatically render this subtree with effector's state and also will automatically "hydrate" client scope with new values, once this update is rendered in the browser.

You're all set. Just use effector's units anywhere in components code via `useUnit` from `effector-react`.

### Dev-Tools integration

Most of `effector` dev-tools options require direct access to the `scope` of the app.
At the client you can get current scope via `getClientScope` function, which will return `Scope` in the browser and `null` at the server.

Example of `@effector/redux-devtools-adapter` integration

```tsx
import type { AppProps } from "next/app";
import { EffectorNext, getClientScope } from "@effector/next";
import { attachReduxDevTools } from "@effector/redux-devtools-adapter";

const clientScope = getClientScope();

if (clientScope) {
  /**
   * Notice, that we need to check for the client scope first
   *
   * It will be `null` at the server
   */
  attachReduxDevTools({
    scope: clientScope,
    name: "playground-app",
    trace: true,
  });
}

function App({
  Component,
  pageProps,
}: AppProps<{ values: Record<string, unknown> }>) {
  const { values } = pageProps;

  return (
    <EffectorNext values={values}>
      <Component />
    </EffectorNext>
  );
}

export default App;
```

## Important caveats

There are a few special nuances of Next.js behaviour, that you need to consider.

### Non-serializable values

If you have Effector stores that contain values that cannot be safely passed to `JSON.stringify`, you will have problems passing the values to the client.

In that case, you have to specify a custom serialization rule through the store settings.

#### Example

`Date` object will be serialized to ISO-string by default, but will not be parsed back to `Date` object via `JSON.parse`.
We can fix it by providing custom serialization rule.

```ts
const $date = createStore<null | Date>(null, {
  serialize: {
    write: (dateOrNull) => (dateOrNull ? dateOrNull.toISOString() : dateOrNull),
    read: (isoStringOrNull) =>
      isoStringOrNull ? new Date(isoStringOrNull) : isoStringOrNull,
  },
});
```

[Docs about custom serialize feature](https://effector.dev/docs/api/effector/createStore#example-with-custom-serialize-configuration)

### Effector's `serialize: "ignore"` is not recommended

Next.js network (and serialization) boundary is placed before any client components rendering, so any stores with `serialize: "ignore"` setting will always use default values for renders, which may lead to confusing results.

#### Example

```tsx
// some-module.ts
const $serverOnlyValue = createStore(null, { serialize: "ignore" })

// $someValue is a derived store - such stores are never included in effector's serialization,
// because it is always possible to safely recalculate them from parent stores
//
// But in this case, combined with `serialize: "ignore"` on parent store, it will lead to confusing result
export const $someValue = $serverOnlyValue.map(value => value ? extractSomeSafeForClientData(value) : null)

// some-component

export function Component() {
 const value = useUnit($someValue)

 return value ? <>{value}<> : <>No value</>
}

// pages/some-page
export async function getServerSideProps(req) {
 const scope = fork()

  await allSettled(appStarted, { scope, params: req })

  // `scope.getState($serverOnlyValue)` is not null at this point
  // as well as `scope.getState($someValue)` is correctly calculated here

  // Next.js network boundary happens here and is separated from rendering components at the server
  return {
   props: {
    values: serialize(scope)
    // `scope.getState($serverOnlyValue)` is stripped off here, it's value will be default one :(
    // And `$someValue` is also calculated as if `$serverOnlyValue` is still null
    //
    // As a result - `Component` will always render "No value"
   }
  }
}
```

#### Workaround

You can workaround it by using another non-derived store, which will be included in effector's serialization.

```tsx
// some-module.ts
const $serverOnlyValue = createStore(null, { serialize: "ignore" })

// $someValue is non-derived and will be included in serialization, if changed
export const $someValue = createStore(null)

sample({
 clock: $serverOnlyValue,
 fn: value => value ? extractSomeSafeForClientData(value) : null,
 target: $someValue,
})

// some-component

export function Component() {
 const value = useUnit($someValue)

 return value ? <>{value}<> : <>No value</>
}

// pages/some-page
export async function getServerSideProps(req) {
 const scope = fork()

  await allSettled(appStarted, { scope, params: req })

  // `scope.getState($serverOnlyValue)` is not null at this point
  // as well as `scope.getState($someValue)` is correctly calculated here

  // Next.js network boundary happens here and is separated from rendering components at the server
  return {
   props: {
    values: serialize(scope)
    // `scope.getState($serverOnlyValue)` is stripped off here, it's value will be default one :(
    // But since `$someValue` is also non-derived store and it was changed on `$serverOnlyValue` update
    // it will be included in `values`
    //
    // As a result - `Component` will render `value` properly
   }
  }
}
```

### ESM dependencies and library duplicates in the bundle

Since Next.js 12 [ESM imports are prioritized over CommonJS imports](https://nextjs.org/blog/next-12#es-modules-support-and-url-imports). While CJS-only dependencies are still supported, it is not recommended to use them.

It may lead to duplicated instances of the library in the bundle, which in case of `@effector/next` or `effector` leads to weird bugs like missing context provider errors.

You can check for library duplicates in the bundle either automatically with [statoscope.tech](https://statoscope.tech/) Webpack Plugin, [which have special rule for this purpose](https://github.com/statoscope/statoscope/blob/master/packages/stats-validator-plugin-webpack/docs/rules/no-packages-dups.md).

You can also check it manually via `Debug -> Sources -> Webpack -> _N_E -> node_modules` tab in the browser developer tools. Duplicated modules will be presented here in both `mjs` and `cjs` kinds.

<img width="418" alt="image" src="https://user-images.githubusercontent.com/32790736/233786487-304cfac0-3686-460b-b2f9-9fb0de38a4dc.png">

## Release process

1. Check out the [draft release](https://github.com/effector/next/releases).
1. All PRs should have correct labels and useful titles. You can [review available labels here](https://github.com/effector/next/blob/main/.github/release-drafter.yml).
1. Update labels for PRs and titles, next [manually run the release drafter action](https://github.com/effector/next/actions/workflows/release-drafter.yml) to regenerate the draft release.
1. Review the new version and press "Publish"
1. If required check "Create discussion for this release"
