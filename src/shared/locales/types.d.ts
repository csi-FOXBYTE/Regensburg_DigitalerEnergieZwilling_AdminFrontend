import hello-world from "../modules/hello-world/locales/en.json";

declare module "i18next" {
	interface CustomTypeOptions {
		resources: {
			hello-world: typeof hello-world,
		}
	}
}
