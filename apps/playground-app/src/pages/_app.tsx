import type { AppProps } from "next/app";
import "mvp.css";

import { Layout } from "#root/features/layout/ui";
import { withEffector } from "nextjs-effector";

function App({ Component }: AppProps<{ values: Record<string, unknown> }>) {
  return (
    <>
      <div>Pages dir</div>
      <Layout>
        <Component />
      </Layout>
    </>
  );
}

export default withEffector(App);
