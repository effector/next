import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

import pkgJson from "./package.json" assert { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));

const external = Object.keys(pkgJson.peerDependencies);

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "EffectorNext",
      // the proper extensions will be added
      fileName: "index",
    },
    rollupOptions: {
      external,
    },
  },
});
