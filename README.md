# Bindings for NextJS

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

## App directory (Next.js Beta)

#### 1. Setup EffectorNext provider as Client Component

New `app` directory considers all components as Server Components by default.

Because of that `EffectorNext` provider won't work as it is, as it uses client-only `createContext` API internally - you will immoderately get a compile error in Next.js

The official way to handle this - [is to re-export such components as modules with "use client" directive](https://beta.nextjs.org/docs/rendering/server-and-client-components#third-party-packages).

To do so, create `effector-provider.tsx` file at the top level of your `app` directory and copy-paste following code from snippet there:

```tsx
// app/effector-provider.tsx
'use client';

import type { ComponentProps } from 'react';
import { EffectorNext } from '#/lib/effector-next';

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
