import { fileURLToPath, URL } from "node:url";
import path from "path";

import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  // console.log("env", env, mode, command);
  return {
    mode: "production",
    plugins: [vue()],
    resolve: {
      alias: [
        {
          // '@': fileURLToPath(new URL('./src', import.meta.url)),
          // '@': path.resolve(__dirname, './src'),
          "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
        },
        {
          find: "vue",
          replacement: "vue/dist/vue.esm-bundler.js", // 需要编译tmp
        },
      ],
    },
    server: {
      host: "0.0.0.0",
      https: false,
      port: 5174,
    },
  };
});
