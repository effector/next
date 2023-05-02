# Bindings for Next.js

> **⚠️ THIS PROJECT IS IN EARLY DEVELOPMENT AND IS NOT STABLE YET ⚠️**

This is minimal compatibility layer for effector + Next.js - it only provides one special `EffectorNext` provider component, which allows to fully leverage effector's Fork API, while handling some *special* parts of Next.js SSR and SSG flow.

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

### Pages directory (Next.js Stable)

#### 1. EffectorNext provider setup

Add provider to the `pages/_app.tsx` and provide it with server-side `values`

```tsx
import { EffectorNext } from "@effector/next"

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
import { fork, allSettled, serialize } from "effector"

import { pageStarted } from "../src/my-page-model"

export async function getStaticProps() {
  const scope = fork();

  await allSettled(pageStarted, { scope, params });

  return {
    props: {
      // notice serialized effector's scope here!
      values: serialize(scope),
    },
  };
};
```

Notice, that serialized scope values are provided via the same page prop, which is used in the `_app` for values in `EffectorNext`.

You're all set. Just use effector's units anywhere in components code via `useUnit` from `effector-react`.

## Important caveats

There are a few special nuances of Next.js behaviour, that you need to consider.

### Effector's `serialize: "ignore"` is not recommended

Effector's `createStore` has `serialize` setting, which allows you to either setup custom rule for store's value serialization or mark it as `ignore` to completely strip this value from serialization.

Normally in typical SSR application you could use it to calculate some server-only value at the server, use it for render, and then just ignore it when serializing.

```tsx
// some-module.ts
export const $serverOnlyValue = createStore(null, { serialize: "ignore" })

// request handler

export async function renderApp(req) {
 const scope = fork()
 
 await allSettled(appStarted, { scope, params: req })
 
 // serialization boundaries
 const appContent = renderToString(
      // scope object can be used for the render directly
      <Provider value={scope}>
        <App />
      </Provider>
    )
 const stateScript = `<script>self.__STATE__ = ${serialize(scope)}</script>` // does not contain value of `$serverOnlyValue`
 
 return htmlResponse(appContent, stateScript)
}
```

But with Next.js serialization boundary happens much earlier, before server renders even started.

It happens because of unique Next.js features like running page logic only at server even for client transitions.

This feature requires, that response of every server data-fetching function is serializable to json string.

That means, that using `serialize: "ignore"` will just hide this store value from server render too.

```tsx
// some-module.ts
export const $serverOnlyValue = createStore(null, { serialize: "ignore" })

// some-component

export function Component() {
 const value = useUnit($serverOnlyValue)
 
 return value ? <>{value}<> : <>No value</>
}

// pages/some-page
export async function getServerSideProps(req) {
 const scope = fork()

  await allSettled(appStarted, { scope, params: req })
  
  // scope.getState($serverOnlyValue) is not null at this point

  return {
   props: {
    values: serialize(scope)
    // scope.getState($serverOnlyValue) is stripped off here :(
    // Component will always render "No value"
   }
  }
}
```

Because of that it is not recommended to use `serialize: "ignore"` if the store is somehow needed for render.

You can use custom serialization config instead

```ts
const $date = createStore<null | Date>(null, {
  serialize: {
    write: dateOrNull => (dateOrNull ? dateOrNull.toISOString() : dateOrNull),
    read: isoStringOrNull =>
      isoStringOrNull ? new Date(isoStringOrNull) : isoStringOrNull,
  },
})
```

[Docs](https://effector.dev/docs/api/effector/createStore#example-with-custom-serialize-configuration)


### ESM dependencies and library duplicates in the bundle

Since Next.js 12 [ESM imports are prioritized over CommonJS imports](https://nextjs.org/blog/next-12#es-modules-support-and-url-imports). While CJS-only dependencies are still supported, it is not recommended to use them.

It may lead to duplicated instances of the library in the bundle, which in case of `@effector/next` or `effector` leads to weird bugs like missing context provider errors.

You can check for library duplicates in the bundle either automatically with [statoscope.tech](https://statoscope.tech/) Webpack Plugin, [which have special rule for this purpose](https://github.com/statoscope/statoscope/blob/master/packages/stats-validator-plugin-webpack/docs/rules/no-packages-dups.md).

You can also check it manually via `Debug -> Sources -> Webpack -> _N_E -> node_modules` tab in the browser developer tools. Duplicated modules will be presented here in both `mjs` and `cjs` kinds.

<img width="418" alt="image" src="https://user-images.githubusercontent.com/32790736/233786487-304cfac0-3686-460b-b2f9-9fb0de38a4dc.png">


## ⚠️ App directory (Next.js Beta) ⚠️

#### 0. Make sure you aware of current status of the App directory

The App directory (or App router) - it is a new Next.js API with new features and conventions.

At the moment it is ⚠️ officialy not production ready ⚠️ and Next.js team explicitly states, that all App directory related features are not following semver, which means that breaking changes are possible even in patch-level releases.

Also, when App directory is enabled, Next.js is using special alpha-version bundle of React - it is needed to support new features like React Server Components. This also means that even your existing code at Pages directory may be broken, e.g. if there is a bug in the alpha version which is not present in the current stable version.

Make sure that you understand the risks and willing to use this experimental API.

#### 1. Setup EffectorNext provider as Client Component

New `app` directory considers all components as Server Components by default.

Because of that `EffectorNext` provider won't work as it is, as it uses client-only `createContext` API internally - you will get a compile error in Next.js

The official way to handle this - [is to re-export such components as modules with "use client" directive](https://beta.nextjs.org/docs/rendering/server-and-client-components#third-party-packages).

To do so, create `effector-provider.tsx` file at the top level of your `app` directory and copy-paste following code from snippet there:

```tsx
// app/effector-provider.tsx
'use client';

import type { ComponentProps } from 'react';
import { EffectorNext } from '@effector/next';

export function EffectorAppNext({
  values,
  children,
}: ComponentProps<typeof EffectorNext>) {
  return <EffectorNext values={values}>{children}</EffectorNext>;
}

```

You should use this version of provider in the `app` directory from now on.

> We will bundle the package using the `"use client"` directive once `app` directory goes stable and there will be more information about directives usage.

#### 2. Setup provider in the Root Layout

To use client components with effector units anywhere in the tree - add `EffectorAppNext` provider (which was created at previous step) at your [Root Layout](https://beta.nextjs.org/docs/routing/pages-and-layouts#root-layout-required)

If you are using [multiple Root Layouts](https://beta.nextjs.org/docs/routing/defining-routes#example-creating-multiple-root-layouts) - each one of them should also have the `EffectorAppNext` provider.

```tsx
// app/layout.tsx
import { EffectorAppNext } from "project-root/app/effector-provider"

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EffectorAppNext>
          {/* rest of the components tree */}
        </EffectorAppNext>
      </body>
     </html>
  )
}
```

#### 3. Server-side computations

Server computations work in a similiar way to `pages` directory, but inside Server Components of the `app` pages.

In this case you will need to add the `EffectorAppNext` provider to the tree of this Server Component and provide it with serialized scope.

```tsx
// app/some-path/page.tsx
import { EffectorAppNext } from "project-root/app/effector-provider"

export default async function Page() {
  const scope = fork();

  await allSettled(pageStarted, { scope, params });

  const values = serialize(scope);

  return (
    <EffectorAppNext values={values}>
      {/* rest of the components tree */}
    </EffectorAppNext>
 )
}
```
This will automatically render this subtree with effector's state and also will automatically "hydrate" client scope with new values.

You're all set. Just use effector's units anywhere in components code via `useUnit` from `effector-react`.

## Release process

1. Check out the [draft release](https://github.com/effector/next/releases).
1. All PRs should have correct labels and useful titles. You can [review available labels here](https://github.com/effector/next/blob/main/.github/release-drafter.yml).
1. Update labels for PRs and titles, next [manually run the release drafter action](https://github.com/effector/next/actions/workflows/release-drafter.yml) to regenerate the draft release.
1. Review the new version and press "Publish"
1. If required check "Create discussion for this release"
