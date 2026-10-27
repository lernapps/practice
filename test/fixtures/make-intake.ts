// Writes _intake/ for the smoke job of check.yml: the minimal fixture, zipped and taken through the intake as an
// issue would. Usage: node test/fixtures/make-intake.ts <out-dir>
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { intake } from "../../actions/validate/validate.ts";
import { buildZip, type Spec } from "../zip-builder.ts";
import { issueBody } from "../support.ts";

const base = new URL("minimal/", import.meta.url).pathname;
const specs: Spec[] = [{ name: "src/" }];
for (const entry of readdirSync(join(base, "src"), { recursive: true, withFileTypes: true })) {
  const path = relative(base, join(entry.parentPath, entry.name));
  specs.push(entry.isDirectory() ? { name: `${path}/` } : { name: path, data: readFileSync(join(base, path)) });
}
const result = intake({
  issue: 1,
  outDir: process.argv[2] ?? "_intake",
  state: "open",
  body: issueBody(),
  download: () => ({ buffer: buildZip(specs) }),
});
if (!result.ok) {
  console.error(JSON.stringify(result.problems));
  process.exit(1);
}
console.log(`intake ok: ${result.zip?.files} files`);
