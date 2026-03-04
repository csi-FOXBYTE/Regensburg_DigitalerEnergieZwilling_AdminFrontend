import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

export function initializeI18Next(lang?: string) {
  if (i18next.isInitialized) return;

  i18next
    .use(
      resourcesToBackend((language: string, namespace: string) =>
        import(`../../modules/${namespace}/locales/${language}.json`).then(
          (module) => module.default[namespace]
        )
      )
    )
    .use(initReactI18next)
    .init({
      lng: lang,
      fallbackLng: config.defaultLanguage,
      defaultNS: [],
      ns: [],
    });
}

const config = {
  defaultLanguage: "en",
  locales: ["en", "de"],
};

export default config;
