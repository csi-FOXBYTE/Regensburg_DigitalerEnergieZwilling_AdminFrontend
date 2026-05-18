import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "http://apisix:9080/docs/json",
    output: {
      target: "./src/api/api.gen.ts",
      client: "react-query",
      mode: "single",
      clean: true,
      baseUrl: "",
      override: {
        mutator: {
          path: "src/lib/apiClient.ts",
          name: "apiClient",
        },
      },
    },
  },
});
