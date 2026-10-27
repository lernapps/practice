// The smoke job's last step: the built site passes the checks that publish makes before it writes to gh-pages.
import { checkSite } from "../../actions/publish/publish.ts";
const report = checkSite(process.argv[2] ?? "_out/site");
if (report.problems.length > 0) {
  console.error(report.problems.join("\n"));
  process.exit(1);
}
console.log(`site ok: ${report.files} files, ${report.bytes} bytes`);
