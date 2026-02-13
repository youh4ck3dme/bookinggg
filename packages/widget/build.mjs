import { build } from "esbuild";

await build({
  entryPoints: ["src/widget.ts"],
  bundle: true,
  minify: false,
  format: "iife",
  target: ["es2019"],
  outfile: "dist/widget.js"
});
