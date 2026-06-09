// @ts-check
import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  integrations: [solidJs()],
  vite: {
    plugins: [tailwindcss()],
  },
});
