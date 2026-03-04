import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import config from "../src/shared/locales";

async function createModule(name: unknown) {
  if (typeof name !== "string")
    throw new Error(
      `Argument was of type "${typeof name}" but was expected to be of type "string"!`
    );

  const root = path.resolve(`./src/modules/${name}`);

  if (existsSync(root)) throw new Error(`Module "${name}" already exists!`);

  await mkdir(root, { recursive: true });

  const folders = ["components", "context", "hooks", "lib", "locales", "types"];

  for (const folder of folders) {
    await mkdir(path.resolve(root, folder));
  }

  await writeFile(
    path.resolve(root, "index.astro"),
    `---

---
`);

  await writeFile(
    path.resolve(root, "index.ts"), `
export type Events {

};`);
  for (const locale of config.locales) {
    await writeFile(path.resolve(root, "locales", `${locale}.json`), "");
  }
}

createModule(process.argv[2]);
