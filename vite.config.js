"use strict";
import { fileURLToPath, URL } from "node:url";
import path from "path";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";

// svg-icon
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

// arco按需加载
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ArcoResolver } from "unplugin-vue-components/resolvers";

// index.html title
import { createHtmlPlugin } from "vite-plugin-html";
import defaultSettings from "./src/settings.js";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log("env", env, mode, command);
  return {
    base: env.VITE_BASE_PATH,
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ArcoResolver()],
      }),
      Components({
        resolvers: [
          ArcoResolver({
            sideEffect: true,
          }),
        ],
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/icons/svg")],
        symbolId: "icon-[dir]-[name]",
      }),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: defaultSettings.title,
            path: env.VITE_BASE_PATH,
          },
        },
      }),
    ],
    build: {
      // 分包
      rollupOptions: {
        // minify: false,// 关闭打包时代码压缩
        manualChunks: (id) => {
          // id对应的就是所有需要打包整合的文件
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
    },
    resolve: {
      alias: {
        // '@': fileURLToPath(new URL('./src', import.meta.url)),
        // '@': path.resolve(__dirname, './src'),
        "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src"),
      },
    },
    server: {
      open: true,
      host: "0.0.0.0",
      https: false,
      port: 5174,
    },
  };
});
