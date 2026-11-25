import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Entry runner: validates the bundled front page, then copies it to /output/entry.png.
// Node standard library only; no network, no randomness, same bytes every run.
const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = "/output";
const target = join(outDir, "entry.png");

const png = readFileSync(source);

// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A.
const magic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
for (let i = 0; i < magic.length; i++) {
  if (png[i] !== magic[i]) {
    throw new Error("entry.png is not a PNG file");
  }
}

const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (png.toString("ascii", 12, 16) !== "IHDR") {
  throw new Error("entry.png has no IHDR chunk where one is expected");
}
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}
if (png.length > 1024 * 1024) {
  throw new Error(`entry.png must be at most 1 MiB, got ${png.length} bytes`);
}

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}
copyFileSync(source, target);
console.log(`front page written to ${target} (${png.length} bytes, 1024x1024)`);
