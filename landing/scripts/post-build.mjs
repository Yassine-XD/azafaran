import { renameSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;

function move(from, to) {
  const src = join(dist, from);
  const dest = join(dist, to);
  if (!existsSync(src)) return;
  mkdirSync(dirname(dest), { recursive: true });
  renameSync(src, dest);
  console.log(`[post-build] moved ${from} → ${to}`);
}

// Move language-root pages into /lang/index.html so they resolve as directory indexes.
move("ca.html", "ca/index.html");
move("en.html", "en/index.html");
