import type { AppProps } from "next/app";
import { EffectorNext, getClientScope } from "@effector/next";
import { attachReduxDevTools } from "@effector/redux-devtools-adapter";
import "mvp.css";
import "../overrides.css";
import { PageLayout } from "#root/features/layout";

const clientScope = getClientScope();

if (clientScope) {
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
  const {
    /**
     * This is the `values` that is result of `serialize(scope)`
     * and was passed to props in the `getServerSideProps` (or other) function
     */
    values,
  } = pageProps;

  return (
    <EffectorNext values={values}>
      <PageLayout>
        <Component />
      </PageLayout>
    </EffectorNext>
  );
}

export default App;
