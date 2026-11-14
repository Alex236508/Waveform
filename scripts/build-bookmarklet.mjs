import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceFiles = [
  "src/core.js",
  "src/audio-engine.js",
  "src/renderer.js",
  "src/interface.js",
  "src/app.js"
];

const [css, ...sources] = await Promise.all([
  readFile(resolve(root, "src/styles.css"), "utf8"),
  ...sourceFiles.map(file => readFile(resolve(root, file), "utf8"))
]);

const bundle = [
  "/* Waveform · CAVA-inspired browser visualizer. Readable source build. */",
  "(() => {",
  '"use strict";',
  `const CAVA_STYLES = ${JSON.stringify(css)};`,
  "const Cava = {};",
  ...sources,
  "})();",
  ""
].join("\n\n");

const outputDirectory = resolve(root, "dist");
await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, "visualizer.bundle.js"), bundle, "utf8");

// Bookmarklet URLs are line-break-free and percent-encode unsafe characters.
// The javascript: prefix is kept literal for direct bookmark URL entry.
const bookmarklet = `javascript:${encodeURIComponent(bundle)}`;
await writeFile(resolve(outputDirectory, "bookmarklet.txt"), bookmarklet, "utf8");

// A development-page bundle uses exactly the same payload as the bookmarklet.
await writeFile(resolve(root, "demo.bundle.js"), bundle, "utf8");

console.log(`Built readable bundle (${bundle.length.toLocaleString()} characters).`);
console.log(`Bookmarklet URL: ${bookmarklet.length.toLocaleString()} characters.`);
console.log("Output: dist/visualizer.bundle.js, dist/bookmarklet.txt, demo.bundle.js");
