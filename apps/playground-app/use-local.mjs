import { $, within, cd } from "zx/core";
import { copy } from "fs-extra";

// build lib
await within(async () => {
  cd("../../");
  await $`pnpm build`;
});

// copy to node_modules
await copy("../../dist", "node_modules/@effector/next/dist");
await copy("../../package.json", "node_modules/@effector/next/package.json");
