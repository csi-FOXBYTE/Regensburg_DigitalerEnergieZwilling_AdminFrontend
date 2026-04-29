import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "http://localhost:8080/swagger/v1/swagger.json",
    output: {
      target: "./src/api/api.gen.ts",
      client: "react-query",
      mode: "single",
      clean: true,
      baseUrl: "http://localhost:8080",
    },
  },
});
