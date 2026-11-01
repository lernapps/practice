#!/usr/bin/env node
// `lernapps-practice init <short name>`: starts an app for an occasion, from the npm registry alone. It is the init of
// @lernapps/tooling with this package as its add-on: the plan template of lernapps practice instead of the tooling's,
// and its skills next to those of the tooling. The tooling is a dependency of this package, so it is installed already
// when `npx --yes @lernapps/practice init <short name>` runs; nothing else is downloaded.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const USAGE = `Usage: lernapps-practice init <short name>

Starts an app for an occasion in the current folder, which must be empty except for .git: the plan template of lernapps
practice as .vibe/plans/01-<short name>.md, and the skills of lernapps practice and of the tooling. Then follow the plan.
Every other command is one of lernapps, the CLI of @lernapps/tooling (npx lernapps --help), in the app that init made.
`;

const [command, ...rest] = process.argv.slice(2);
if (command === "-h" || command === "--help") {
  process.stdout.write(USAGE);
  process.exit(0);
}
if (command !== "init" || rest.length !== 1) {
  process.stderr.write(`lernapps-practice: ${command === undefined ? "no command given" : `unknown command or arguments: ${[command, ...rest].join(" ")}`}\n\n${USAGE}`);
  process.exit(2);
}
const manifest = createRequire(import.meta.url).resolve("@lernapps/tooling/package.json");
const bin = JSON.parse(readFileSync(manifest, "utf8")).bin?.lernapps ?? "dist/cli.mjs";
const result = spawnSync(process.execPath, [join(dirname(manifest), bin), "init", rest[0], "--addon", "@lernapps/practice"], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
