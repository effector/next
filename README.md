# nextjs-binds

This is minimal compatibility layer for effector + Next.js - it only provides one special `EffectorNext` provider component, which allows to fully leverage effector's Fork API, while handling some *special* parts of Next.js SSR and SSG flow.

So far there are no plans to extend the API, e.g., towards better DX - there are already packages like [`nextjs-effector`](https://github.com/risenforces/nextjs-effector).
This package aims only at technical nuances.

## Usage

### Pages directory

1. Start your computations in server handlers using Fork API

```tsx
export const getStaticProps = async () => {
  const scope = fork();

  await allSettled(serverUp, { scope });

  return {
    props: {
      // notice serialized effector's scope here!
      values: serialize(scope),
    },
  };
};
```

2. Add provider to the `pages/_app.tsx` and provide it with server-side `values`

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

You're all set. Just use effector's units anywhere in components code via `useUnit` from `effector-react`.


## App directory

In the `app` directory there are no separate server handlers - because of it steps are a bit different.

1. To just use client components with effector units anywhere in the tree - add `EffectorNext` provider at your [Root Layout](https://beta.nextjs.org/docs/routing/pages-and-layouts#root-layout-required)
If you are using [multiple Root Layouts](https://beta.nextjs.org/docs/routing/defining-routes#example-creating-multiple-root-layouts) - each one of them should also have the `EffectorNext` provider.

```tsx
// app/layout.tsx

export function function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="[color-scheme:dark]">
      <body className="overflow-y-scroll bg-gray-1100 bg-[url('/grid.svg')]">
        <EffectorNext>
         // components
        </EffectorNext>
     </html>
  )
}
```

2. Server computations work in a similiar to `pages` way, but inside Server Components of the `app` pages.
In this case you also will need to add the `EffectorNext` provider to the tree + provide it with serialized scope.

```tsx
// app/some-path/page.tsx

export default async function Page() {
  const scope = fork();

  await allSettled(serverUp, { scope });

  const values = serialize(scope);

  return (
    <EffectorNext values={values}>
     // rest of the components tree
    </EffectorNext>
 )
}
```
This will both automatically render this subtree with effector's state and also will automatically "hydrate" client scope with new values.

You're all set. Just use effector's units anywhere in components code via `useUnit` from `effector-react`.


