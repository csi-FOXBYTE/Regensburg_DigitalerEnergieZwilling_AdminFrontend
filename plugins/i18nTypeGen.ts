import type { ViteUserConfig } from "astro";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

export default function i18nTypeGen(
  options: { defaultLang: string } = {
    defaultLang: "en",
  }
): Exclude<ViteUserConfig["plugins"], undefined>[number] {
  let root = "";

  const src = "src/modules";
  const dest = "src/shared/locales/types.d.ts";

  const generate = async () => {
    let imports = "";
    let typedef = 'declare module "i18next" {\n';
    typedef += "\tinterface CustomTypeOptions {\n";
    typedef += "\t\tresources: {\n";

    const modules = await readdir(path.resolve(root, src));

    for (const module of modules) {
      imports += `import ${module} from "../modules/${module}/locales/${options.defaultLang}.json";\n`;

      typedef += `\t\t\t${module}: typeof ${module},\n`;
    }

    typedef += "\t\t}\n";
    typedef += "\t}\n";
    typedef += "}\n";

    await writeFile(path.resolve(dest), [imports, typedef].join("\n"));
  };

  return {
    name: "vite-plugin-i18n-typegen",
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      generate();
    },
    async handleHotUpdate({ file, server }) {
      if (file.includes(src) && file.endsWith(".json")) {
        generate();

        server.ws.send({ type: "full-reload" });
      }
    },
  };
}
