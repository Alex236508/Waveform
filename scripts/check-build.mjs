import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundle = await readFile(resolve(root, "dist/visualizer.bundle.js"), "utf8");
const bookmarklet = await readFile(resolve(root, "dist/bookmarklet.txt"), "utf8");

if (!bookmarklet.startsWith("javascript:")) throw new Error("Bookmarklet URL is missing the javascript: scheme.");
if (bookmarklet.length < 10000) throw new Error("Bookmarklet output is unexpectedly small.");
if (bookmarklet.includes("\n") || bookmarklet.includes("\r")) throw new Error("Bookmarklet output must be a single line.");
if (bundle.includes("import ") || bundle.includes("export ")) throw new Error("Bundle still contains module syntax.");

const decodedBookmarklet = decodeURIComponent(bookmarklet.slice("javascript:".length));
if (decodedBookmarklet !== bundle) throw new Error("Bookmarklet payload does not match the readable bundle.");

// Parse-check the built payload without executing browser APIs.
new vm.Script(decodedBookmarklet, { filename: "visualizer.bundle.js" });
console.log("Build check passed: bookmarklet prefix, one-line format, payload parity, and JavaScript syntax are valid.");
