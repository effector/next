# Bindings for Next.js

This is minimal compatibility layer for effector + Next.js - it only provides one special `EffectorNext` provider component, which allows to fully leverage effector's Fork API, while handling some _special_ parts of Next.js SSR and SSG flow.

## Installation

```bash
npm add effector effector-react @effector/next
```

Also, you can use Yarn or **PNPM** to install dependencies.

## Usage

You can find example app at the [`apps/playground-app`](/apps/playground-app) - it contains both App Router and Pages Router usage examples in various cases.

### SIDs

To serialize and transfer state of effector stores between the network boundaries all stores must have a Stable IDentifier - sid.

Sid's are added automatically via either built-in babel plugin or our experimental SWC plugin.

#### Babel-plugin

Effector comes with built-in official Babel plugin, which you can use for SIDs:

```json
{
  "presets": ["next/babel"],
  "plugins": ["effector/babel-plugin"]
}
```

Notice, that **you don't need** the `reactSsr` option of the plugin, when using `@effector/next`. The `reactSsr` is a legacy API which is deprecated in the latest release of Effector.

[Read the docs](https://effector.dev/docs/api/effector/babel-plugin/#usage)

#### SWC Plugin

There is an awesome community made and supported SWC port of the plugin, check this out:

[Read effector SWC plugin documentation](https://github.com/kireevmp/effector-swc-plugin)

### Effector ESlint Plugin

It is recommened to install the official [Effector ESlint Plugin](https://eslint.effector.dev/) with React Preset, it will help you follow best practices and avoid common mistakes, like always using `useUnit`

#### Installation

See the [installation guide here](https://github.com/effector/eslint-plugin?tab=readme-ov-file#installation).

#### Setup

**.eslintrc**

```json
{
  "plugins": ["effector"],
  "extends": ["plugin:effector/react"]
}
```

#### Don't forget `useUnit` for all `effector` units

In SSR applications all of effector's units need to be "binded" to the current `Scope`, which means that you should always use `useUnit` in components:

```tsx
import { useUnit } from "effector-react"
import { eventTriggered, effectFx, $store } from "./model"

export function Component() {
 const {
  value,
  trigger,
  callEffect
 } = useUnit({
   value: $store,
   trigger: eventTriggered,
   callEffect: effectFx
 })

 // rest of the components code
}
```
You can find full docs about `useUnit` [here](https://effector.dev/docs/api/effector-react/useUnit).

The official [Effector ESlint Plugin](https://eslint.effector.dev/) with React Preset will help you to follow this rule.

### [Pages Router](https://nextjs.org/docs/pages/building-your-application/routing) usage

Before Next.js `13.4.0` Pages router was the main way to build Next.js applications. 
The Pages Router [will be supported for multiple Next.js major updates](https://nextjs.org/blog/next-13-4#is-the-pages-router-going-away).

The `@effector/next` fully supports Pages Router out of the box.

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

Start your computations in server handlers using Fork API. Workflow is the same for all server-side functions of Next.js.

**`getStaticProps` example**

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

Notice, that serialized scope values are provided via the same `values` prop, which is used in the `_app.tsx` for providing values to `EffectorNext`.
It is up to you to pick some prop name to connect server handlers with client prop in `_app.tsx`.

#### 3. Next.js Pages Router API Usage

There is a bunch of special APIs, which work in the Pages Router mode.

[See the relevant Next.js docs for API details](https://nextjs.org/docs/pages/api-reference)

**`getServerSideProps` with `{ notFound: true }`**

You can return a special object of `{ notFound: true }` shape to command Next.js render the [common 404 page](https://nextjs.org/docs/pages/building-your-application/routing/custom-error#404-page)

```tsx
import { fork, allSettled, serialize } from "effector";

import { pageStarted, $isNotFound } from "../src/my-page-model";

export async function getStaticProps() {
  const scope = fork();

  await allSettled(pageStarted, { scope, params });

  if (scope.getState($isNotFound)) {
    // If, after all computations there is still something missing,
    // and user is meant to see the 404

    return {
      notFound: true,
    }
  }

  return {
    props: {
      // notice serialized effector's scope here!
      values: serialize(scope),
    },
  };
}
```
☝️ This `scope.getState` pattern works the same way for any other Next.js Pages Router server-side APIs, as well as for App Router APIs (see below)

You're all set. Just use effector's units anywhere in components code via `useUnit` from `effector-react`.

Also see the [`nextjs-effector`](https://github.com/risen228/nextjs-effector) package (_yeah, naming of the Next.js-related packages is kind of compicated_), which provides better DX to Pages Router usage and is built on top of the `@effector/next`.

## [App Router](https://nextjs.org/docs/app/building-your-application/routing) usage

The App Router is a new paradigm for building Next.js applications using React's latest features, which declared stable since Next.js `13.4.0`.

The `@effector/next` fully supports App Router out of the box.

#### 1. Setup provider in the Root Layout

To use client components with effector units anywhere in the tree - add `EffectorNext` provider at your [Root Layout](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required)

If you are using [multiple Root Layouts](https://nextjs.org/docs/app/building-your-application/routing/route-groups#creating-multiple-root-layouts) - each one of them should also have the `EffectorNext` provider.

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

☝️ This will allow any component anywhere in the tree to access any Effector store, regardless of whether that page performs any server-side computations or not

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

☝️ This will automatically render [this subtree](https://github.com/effector/next/tree/main#app-router-architecture-edge-case) with calculated effector's state and also will automatically "hydrate" **client scope** with new values, once this update is rendered in the browser.

#### 3. Next.js API's usage

Start your computations via Fork API and use `scope.getState` to extract data from stores and provide it to the Next.js API's like [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

It should be noted, that `getState` usage is typically undesirable in production code - except for the cases when you need to connect effector with some external thing or api, which is exactly the case with Next.js here.

##### `generateStaticParams` example

[See relevant Next.js docs for API details](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

```tsx
// app/blog/[slug]/page.tsx
import { fork, allSettled, serialize } from "effector"

import { blogPostOpened, blogPostsStarted, $postsList } from "@app/features/blog"

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams() {
  const scope = fork();

  await allSettled(blogPostsStarted, { scope });

  const posts = scope.getState($postsList); // { name: string; id: string; }[]

  // map to match `[slug]` param naming
  return posts.map(({ id }) => ({ slug: id }));
}

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const scope = fork();

  await allSettled(blogPostOpened, { scope, params: { id: slug } });

  const values = serialize(scope);

  return (
    <EffectorNext values={values}>
      {/* rest of the components tree */}
    </EffectorNext>
  );
}
```

##### `notFound` and `redirect` example

There are few special functions, which, when called from inside of an server component, will throw a special exception, which will command Next.js to perform redirect somewhere.
The `notFound` function will redirect to `notFound.tsx` view for a current page.

[See relevant Next.js docs for API details](https://nextjs.org/docs/app/api-reference/functions/not-found)

```tsx
// app/blog/[slug]/page.tsx
import { fork, allSettled, serialize } from "effector"
import { notFound } from "next/navigation"

import { blogPostOpened, $currentPost } from "@app/features/blog"

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const scope = fork();

  await allSettled(blogPostOpened, { scope, params: { id: slug } });

  if (!scope.getState($currentPost)) {
    // If there is no current post available after all computations
    // Next.js redirect to `notFound.tsx` is triggered
    notFound()
  }

  const values = serialize(scope);

  return (
    <EffectorNext values={values}>
      {/* rest of the components tree */}
    </EffectorNext>
  );
}
```
☝️ It works the same for any other of Next.js special functions: if you need to access the store value outside of client components, you will need to use `scope.getState`.

##### `Server Actions` example

1. Server actions must be created [as usual](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations).

```typescript
// src/feature/action.ts
"use server"

export const myAction = async () => doServerOnlyStuff()
```

2. Then server action can be used in Effector models as an [effect handler](https://effector.dev/en/api/effector/createeffect/)

```typescript
// src/feature/model.ts
import { createEffect } from "effector"
import { myAction } from "./action.ts"

const myActionFx = createEffect(myAction)
```
☝️ This effect can be called anywhere

That's it.

See [`apps/playground-app/src/features/server-action`](https://github.com/effector/next/tree/main/apps/playground-app/src/features/server-action) for live example.

#### Don't forget about `use client` for client components:

Just [write effector's models as usual](https://effector.dev/) and use effector's units anywhere in components code [via `useUnit` from `effector-react`](https://effector.dev/docs/api/effector-react/useUnit) - but don't forget, that to use hooks you need the `"use client"` directive.

```tsx
// src/features/blog/post.view.tsx
// you should use `use client`, if your component uses any hooks
"use client"
import { useUnit } from "effector-react"
import { Title, Content } from "@app/shared/ui-kit"
import { PostCommentsView } from "@app/features/comments"

import { $currentPost } from "./model.ts"

export function CurrentBlogPost() {
  const post = useUnit($currentPost)

  return (
    <article>
      <Title{post.title}</Title>
      <Content>
        {post.content}
      </Content>
      <PostCommentsView postId={post.id} />
    </article>
  )
}
```

### Dev-Tools integration

Most of `effector` dev-tools options require direct access to the `scope` of the app.
At the client you can get current scope via `getClientScope` function, which will return `Scope` in the browser and `null` at the server.

Here are few examples of `@effector/redux-devtools-adapter` integration.

#### Pages Router Dev-Tools example

In case of Pages Router dev-tools setup must be placed at the [custom App component file (pages/\_app.tsx)](https://nextjs.org/docs/pages/building-your-application/routing/custom-app).

```tsx
// pages/_app.tsx
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

#### App Router Dev-Tools example

In case of the App Router dev-tools setup must be placed at the [the Root Layout](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required) - this way dev-tools integration will work for all pages of the app.

##### Create client component

Since Redux Dev-Tools are client thing - we need to prepare it as a client component.

```tsx
// src/shared/redux-dev-tools-provider.tsx
"use client";

import { getClientScope } from "@effector/next";
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
    name: "playground-app-app-router",
    trace: true,
  });
}

export function ReduxDevToolsAdapter({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <>{children}</>;
}
```

##### Add this component to the Root Layout

```tsx
// app/layout.tsx
import { EffectorNext } from "@effector/next";

import { ReduxDevToolsAdapter } from "app-root/shared/redux-dev-tools-provider"

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxDevToolsAdapter />
        <EffectorNext>{children}</EffectorNext>
      </body>
    </html>
  );
}
```

## Important caveats

There are a few special nuances of Next.js behaviour, that you need to consider.

### Using Pages Router along with App Router

Be aware that Next.js basically builds two different app bundles for Pages and App Router modes.

Transitions between pages of `Pages Router` and `App Router` are always performed via full page reload blowing away any client state.
This is enough for gradual `App Router` adoption, but if you want the best experience, you should avoid mixing different Router modes in the same application. Pages that users frequently transition between should ideally move to `App Router` together.

New apps should always be started with App Router, as it is the main way to build Next.js applications now.

### App Router architecture edge-case

There is a known caveat with App Router architecture, which, so far, applies to `effector` and `@effector/next` too:

**Layout Components, Page Components and any nested React Server Components cannot be aware of each other during server rendering.**

☝️ It means that if there is a some effector's store, that is used in the Layout Component and later is updated during rendering of Page Component - at the client browser there might be a layout flicker visible at the Layout Component.

It happens, because at the server, by the moment of Page Component rendering, its Layout **had already rendered** its part of the response, including all components in it, which will use the stores state at the moment of their rendering. So, if such store is later changed in Page Component - Layout Compoment at the client will "see" and react to this change only after hydration at the client.

You can reproduce that behavior in the example [`playground-app`](/apps/playground-app), by changing the `$counter` store, which controls the state of the counter button in the navbar which is rendered at the common `layout.tsx`, in some of `page.tsx` components.

The navbar counter button will first be visible with count `0` (as it is a state of the `$counter` at the moment of layout render) and then it will change to whatever value was set during `page.tsx` render.

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

### Do not use `$store.watch` calls for debugging

The `$store.watch` method works well for speeding up debugging in SPA-like environments, because in such cases effector applications usually run without `Scope`.
However, this is not the case for Next.js, which runs as an SSR application - there are Scope instances on the server and client, and the actual state of the application is also stored in Scope.
You can find more details [in this article](https://beta.effector.dev/en/guides/server-side-rendering/).

The problem is that `$store.watch(cb)` call triggers `cb` immediately with current "non-scope" state of this store - it works this way due to historical reasons, as the watch API was created before Scopes and SSR support.

You can find detailed explainer in this article:
https://withease.pages.dev/magazine/watch_calls

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
