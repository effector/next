import "zx/globals";

import { resolve } from "node:path";

const DIRECTIVE = `'use client';`;

const pkgJson = await fs.readJson(resolve("package.json"));

const indexFilePaths = Object.values(pkgJson.exports["."]).map((path) =>
  resolve(path)
);

for (const path of indexFilePaths) {
  console.log(chalk.blue(`Injecting ${DIRECTIVE} into ${path}`));
  await injectUseClient(path);
  console.log(chalk.green(`Injected ✅`));
}

async function injectUseClient(path) {
  const content = await fs.readFile(path, "utf-8");

  if (content.startsWith(DIRECTIVE)) return;

  await fs.writeFile(path, `${DIRECTIVE}\n\n${content}`);
}
