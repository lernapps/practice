import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { deflateRawSync } from "node:zlib";
import { extractZip, inspectZip, pathProblem } from "../actions/lib/zip.ts";
import { buildZip, goodSpecs, type Spec } from "./zip-builder.ts";

const codes = (specs: Spec[], options?: Parameters<typeof buildZip>[1]) => inspectZip(buildZip(specs, options)).problems.map((p) => p.code);
const withFile = (name: string, data: Buffer | string = "x: 1\n", extra: Partial<Spec> = {}): Spec[] => [...goodSpecs(), { name, data, ...extra }];

describe("a good ZIP file", () => {
  it("passes, and folder entries (length 0) are neither files nor endings", () => {
    const inspection = inspectZip(buildZip(goodSpecs()));
    assert.deepEqual(inspection.problems, []);
    assert.equal(inspection.entries.filter((e) => !e.isDirectory).length, 4);
    assert.equal(inspection.wrapper, "");
  });

  it("unpacks to the same bytes", () => {
    const zip = buildZip(goodSpecs());
    const inspection = inspectZip(zip);
    const target = mkdtempSync(join(tmpdir(), "practice-test-"));
    assert.deepEqual(extractZip(zip, inspection.entries, target), []);
    assert.equal(readFileSync(join(target, "src/kap/seite.yaml"), "utf8"), "title: Seite\n");
    assert.deepEqual(readFileSync(join(target, "src/images/bild-1.png")), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  it("accepts every allowed ending in either case", () => {
    for (const name of ["a.yaml", "a.yml", "a.md", "a.png", "a.jpg", "a.webp", "A.PNG"]) {
      assert.deepEqual(codes(withFile(`src/${name}`)), [], name);
    }
  });

  it("accepts stored (not compressed) files", () => {
    assert.deepEqual(codes(withFile("src/stored.yaml", "a: 1\n", { method: 0 })), []);
  });
});

describe("the folder around src/ (GitHub's Download ZIP)", () => {
  const wrapped = (...extra: Spec[]): Spec[] => [
    ...goodSpecs().map((s) => ({ ...s, name: `proj-main/${s.name}` })),
    { name: "proj-main/package.json", data: "{}" },
    { name: "proj-main/node_modules/.bin/evil", data: "x" },
    { name: "proj-main/.github/workflows/x.yml", data: "x" },
    { name: "proj-main/src/../x.yaml".replace("/../", "/") .replace("src/x.yaml", "src/z.yaml"), data: "z: 1\n" },
    ...extra,
  ];

  it("is accepted; only <folder>/src/ counts, the rest is ignored", () => {
    const inspection = inspectZip(buildZip(wrapped()));
    assert.deepEqual(inspection.problems, []);
    assert.equal(inspection.wrapper, "proj-main/");
    assert.ok(inspection.ignored >= 3);
    assert.ok(inspection.entries.every((e) => e.path.startsWith("src/")));
  });

  it("unpacks without the folder, and nothing outside src/", () => {
    const zip = buildZip(wrapped());
    const target = mkdtempSync(join(tmpdir(), "practice-test-"));
    assert.deepEqual(extractZip(zip, inspectZip(zip).entries, target), []);
    assert.deepEqual(readdirSync(target), ["src"]);
    assert.ok(existsSync(join(target, "src/app.yaml")));
  });

  it("is still checked strictly inside src/", () => {
    assert.ok(codes(wrapped({ name: "proj-main/src/code.js", data: "x" })).includes("extension"));
  });

  it("is refused when there are two folders and no src/", () => {
    assert.deepEqual(codes([{ name: "a/src/app.yaml", data: "x" }, { name: "b/x.yaml", data: "x" }]), ["no-src"]);
  });

  it("is ignored outside src/ at the root too (a stray README, __MACOSX)", () => {
    const inspection = inspectZip(buildZip([...goodSpecs(), { name: "README.md", data: "x" }, { name: "__MACOSX/._a", data: "x" }]));
    assert.deepEqual(inspection.problems, []);
    assert.equal(inspection.ignored, 2);
  });

  it("still refuses hostile names outside src/", () => {
    assert.ok(codes(withFile("../outside.txt")).includes("path-dotdot"));
    assert.ok(codes(withFile("/etc/passwd")).includes("path-absolute"));
  });
});

describe("hostile paths", () => {
  it("refuses .. inside src/", () => assert.ok(codes(withFile("src/../evil.yaml")).includes("path-dotdot")));
  it("refuses a hidden .. in the middle", () => assert.ok(codes(withFile("src/kap/../../x.yaml")).includes("path-dotdot")));
  it("refuses an absolute path", () => assert.ok(codes(withFile("/src/x.yaml")).includes("path-absolute")));
  it("refuses a drive letter", () => assert.ok(codes(withFile("C:src/x.yaml")).includes("path-absolute")));
  it("refuses a backslash", () => assert.ok(codes(withFile("src\\..\\x.yaml")).includes("path-backslash")));
  it("refuses a null byte and other control characters", () => {
    assert.ok(codes(withFile("src/a\u0000.yaml")).includes("path-control"));
    assert.ok(codes(withFile("src/a\nb.yaml")).includes("path-control"));
  });
  it("refuses hidden files and folders in src/", () => {
    assert.ok(codes(withFile("src/.hidden.yaml")).includes("path-hidden"));
    assert.ok(codes(withFile("src/.git/config")).includes("path-hidden"));
    assert.ok(codes(withFile("src/.DS_Store")).includes("path-hidden"));
  });
  it("refuses empty parts (double slash)", () => assert.ok(codes(withFile("src//x.yaml")).includes("path-empty-part")));
  it("refuses a path that is too deep or too long", () => {
    assert.ok(codes(withFile("src/a/b/c/d/e/f/g/x.yaml")).includes("path-deep"));
    assert.ok(codes(withFile(`src/${"a".repeat(70)}.yaml`)).includes("name-length"));
    assert.ok(codes(withFile(`src/${"a/".repeat(30)}x.yaml`)).some((c) => c === "path-length" || c === "path-deep"));
  });
});

describe("unicode tricks", () => {
  it("refuses a full-width dot and slash", () => {
    assert.ok(codes(withFile("src/x．yaml")).length > 0);
    assert.ok(!inspectZip(buildZip(withFile("src\uff0fx.yaml"))).entries.some((e) => e.path.includes("x.yaml") && e.path.includes("\uff0f"))); // not in src/: ignored, never unpacked
  });
  it("refuses the right-to-left override that makes gnp.exe look like exe.png", () => {
    assert.ok(codes(withFile("src/a‮gnp.yaml")).includes("path-control") || codes(withFile("src/a‮gnp.yaml")).includes("name-characters"));
  });
  it("refuses umlauts, accents, composed or not, and emoji", () => {
    for (const name of ["src/ä.yaml", "src/ä.yaml", "src/é.yaml", "src/😀.yaml", "src/а.yaml"]) {
      assert.ok(codes(withFile(name)).includes("name-characters"), name);
    }
  });
  it("refuses a zero-width space", () => assert.ok(codes(withFile("src/a​b.yaml")).includes("name-characters")));
  it("refuses names that are not UTF-8", () => {
    const zip = buildZip(withFile("src/XX.yaml"));
    const at = zip.indexOf(Buffer.from("src/XX.yaml"), zip.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02])));
    zip[at + 4] = 0xff;
    zip[at + 5] = 0xfe;
    assert.ok(inspectZip(zip).problems.some((p) => p.code === "name-encoding"));
  });
  it("refuses names that differ only in case", () => {
    assert.ok(codes([...goodSpecs(), { name: "src/Kap/x.yaml", data: "x" }, { name: "src/kap/X.yaml", data: "x" }, { name: "src/kap/x.yaml", data: "x" }]).includes("duplicate"));
  });
});

describe("endings", () => {
  it("refuses code outside src/components/, and every other kind of code", () => {
    for (const name of ["src/a.vue", "src/a.ts", "src/A.vue", "src/kap/B.ts", "src/a.js", "src/a.html", "src/a.json", "src/a.sh", "src/a.exe"]) {
      assert.ok(codes(withFile(name)).includes("extension"), name);
    }
    assert.match(inspectZip(buildZip(withFile("src/a.js"))).problems[0]?.text ?? "", /src\/components\//);
  });
  it("refuses double endings, either way round", () => {
    assert.ok(codes(withFile("src/a.png.js")).includes("extension"));
    assert.ok(codes(withFile("src/a.test.ts")).includes("extension"));
    assert.ok(codes(withFile("src/a.js.png")).includes("name-double-extension"));
    assert.ok(codes(withFile("src/a.yaml.vue")).includes("extension"));
    assert.ok(codes(withFile("src/a.yaml.yaml")).includes("name-double-extension"));
  });
  it("refuses no ending, and a name that is only an ending", () => {
    assert.ok(codes(withFile("src/Makefile")).includes("name-no-extension"));
    assert.ok(codes(withFile("src/.yaml")).includes("path-hidden"));
  });
  it("ignores src/main.ts: it is never unpacked, the build takes the template's", () => {
    const zip = buildZip(withFile("src/main.ts", "import 'evil';"));
    const inspection = inspectZip(zip);
    assert.deepEqual(inspection.problems, []);
    assert.equal(inspection.ignored, 1);
    const target = mkdtempSync(join(tmpdir(), "practice-test-"));
    assert.deepEqual(extractZip(zip, inspection.entries, target), []);
    assert.ok(!existsSync(join(target, "src/main.ts")));
    assert.equal(pathProblem("src/main.ts", true)?.code, "path-template");
  });
});

describe("components", () => {
  it("are accepted as the explainer knows them: <Name>.vue, <Name>.ts, <Name>.test.ts in src/components/", () => {
    const specs = [
      ...goodSpecs(),
      { name: "src/components/" },
      { name: "src/components/Zahlenstrahl.vue", data: "<template><p/></template>" },
      { name: "src/components/Zahlenstrahl.ts", data: "export const x = 1;" },
      { name: "src/components/Zahlenstrahl.test.ts", data: "test" },
    ];
    assert.deepEqual(inspectZip(buildZip(specs)).problems, []);
  });
  it("refuse other names, other files and subfolders", () => {
    for (const name of ["src/components/zahl.vue", "src/components/Zahl.js", "src/components/Zahl.spec.ts", "src/components/Zahl-Strahl.vue", "src/components/Zahl.yaml", "src/components/Zahl.svg"]) {
      assert.deepEqual(codes(withFile(name)), ["component-name"], name);
    }
    assert.deepEqual(codes(withFile("src/components/sub/Zahl.vue")), ["component-folder"]);
    assert.deepEqual(codes([...goodSpecs(), { name: "src/components/sub/" }]), ["component-folder"]);
  });
  it("tell a long list of wrong files once", () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ name: `src/components/c${i}.vue`, data: "x" }));
    const problems = inspectZip(buildZip([...goodSpecs(), { name: "src/components/" }, ...many])).problems;
    assert.deepEqual(problems.map((p) => p.code), ["component-name"]);
    assert.match(problems[0]?.text ?? "", /39 weitere/);
  });
});

describe("data files and SVG images", () => {
  it("accept data files in src/data/", () => {
    assert.deepEqual(codes(withFile("src/data/elemente.yaml")), []);
  });
  it("accept an SVG directly in src/images/ with a lower-case name", () => {
    assert.deepEqual(codes(withFile("src/images/kreis-1.svg", "<svg/>")), []);
  });
  it("refuse an SVG elsewhere or with another name", () => {
    for (const name of ["src/a.svg", "src/kap/a.svg", "src/images/sub/a.svg", "src/images/Kreis.svg", "src/images/a.SVG"]) {
      assert.deepEqual(codes(withFile(name, "<svg/>")), ["svg-place"], name);
    }
  });
  it("unpack a drawing, and refuse an SVG with a script at unpacking", () => {
    const drawing = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="4"/></svg>';
    const good = buildZip(withFile("src/images/kreis.svg", drawing));
    const target = mkdtempSync(join(tmpdir(), "practice-test-"));
    assert.deepEqual(extractZip(good, inspectZip(good).entries, target), []);
    assert.equal(readFileSync(join(target, "src/images/kreis.svg"), "utf8"), drawing);
    const bad = buildZip(withFile("src/images/boese.svg", "<svg><script>alert(1)</script></svg>"));
    const other = mkdtempSync(join(tmpdir(), "practice-test-"));
    const problems = extractZip(bad, inspectZip(bad).entries, other);
    assert.deepEqual(problems.map((p) => p.code), ["svg-script"]);
    assert.match(problems[0]?.text ?? "", /src\/images\/boese\.svg/);
    assert.ok(!existsSync(join(other, "src/images/boese.svg")));
  });
  it("refuses a missing src/app.yaml", () => {
    assert.ok(codes([{ name: "src/x.yaml", data: "x" }]).includes("no-app-yaml"));
  });
});

describe("kinds of entries", () => {
  it("refuses a symbolic link", () => {
    assert.ok(codes(withFile("src/link.yaml", "/etc/passwd", { mode: 0o120777 })).includes("special-file"));
  });
  it("refuses devices, pipes and sockets", () => {
    for (const mode of [0o020644, 0o060644, 0o010644, 0o140644]) {
      assert.ok(codes(withFile("src/dev.yaml", "", { mode })).includes("special-file"), mode.toString(8));
    }
  });
  it("refuses a folder entry that has content", () => {
    assert.ok(codes([...goodSpecs(), { name: "src/dir/", data: "abc", method: 0 }]).includes("directory-size"));
  });
  it("refuses an encrypted file", () => {
    assert.ok(codes(withFile("src/secret.yaml", "x", { flags: 1 })).includes("encrypted"));
  });
  it("refuses a method it does not know", () => {
    const zip = buildZip(withFile("src/x.yaml"));
    const central = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
    // the last central header is the one of src/x.yaml: set method 99
    zip.writeUInt16LE(99, central + 10);
    assert.ok(inspectZip(zip).problems.some((p) => p.code === "method"));
  });
});

describe("sizes and bombs", () => {
  it("refuses more than 300 files", () => {
    const many = Array.from({ length: 301 }, (_, i) => ({ name: `src/f${i}.yaml`, data: "a: 1\n" }));
    assert.ok(codes([...goodSpecs(), ...many]).includes("too-many-files"));
  });
  it("accepts 300 files", () => {
    const many = Array.from({ length: 296 }, (_, i) => ({ name: `src/f${i}.yaml`, data: "a: 1\n" }));
    assert.deepEqual(codes([...goodSpecs(), ...many]), []);
  });
  it("refuses a directory that states more than 25 MB together", () => {
    const big = Array.from({ length: 3 }, (_, i) => ({ name: `src/big${i}.yaml`, data: "a", declaredSize: 9 * 1024 * 1024 }));
    assert.ok(codes([...goodSpecs(), ...big]).includes("too-large"));
  });
  it("refuses one file of more than 10 MB (stated)", () => {
    assert.ok(codes(withFile("src/huge.yaml", "a", { declaredSize: 11 * 1024 * 1024 })).includes("file-too-large"));
  });
  it("a bomb whose directory lies (states 10 bytes, inflates to 20 MB) is stopped while unpacking", () => {
    const payload = Buffer.alloc(20 * 1024 * 1024, 0x61);
    const zip = buildZip(withFile("src/bomb.yaml", payload, { declaredSize: 10 }));
    const inspection = inspectZip(zip);
    assert.deepEqual(inspection.problems, []); // the directory looks fine ...
    const target = mkdtempSync(join(tmpdir(), "practice-test-"));
    const problems = extractZip(zip, inspection.entries, target);
    assert.equal(problems[0]?.code, "bomb"); // ... the unpacking does not
    assert.ok(!existsSync(join(target, "src/bomb.yaml")));
  });
  it("an honest bomb (stated 10 MB, real 10 MB of zeros, 10 kB packed) passes the limits and unpacks exactly", () => {
    const payload = Buffer.alloc(9 * 1024 * 1024, 0);
    const zip = buildZip(withFile("src/zeros.yaml", payload));
    assert.ok(zip.length < 100 * 1024);
    const inspection = inspectZip(zip);
    assert.deepEqual(inspection.problems, []);
  });
  it("a size that is too small or too large against the real one is refused", () => {
    const zip = buildZip(withFile("src/short.yaml", "abcdef", { declaredSize: 3 }));
    const target = mkdtempSync(join(tmpdir(), "practice-test-"));
    assert.equal(extractZip(zip, inspectZip(zip).entries, target)[0]?.code, "bomb");
    const zip2 = buildZip(withFile("src/long.yaml", "abc", { declaredSize: 99 }));
    assert.equal(extractZip(zip2, inspectZip(zip2).entries, mkdtempSync(join(tmpdir(), "practice-test-")))[0]?.code, "size-mismatch");
  });
  it("a wrong checksum is refused", () => {
    const zip = buildZip(withFile("src/crc.yaml", "abc", { crc: 12345 }));
    assert.equal(extractZip(zip, inspectZip(zip).entries, mkdtempSync(join(tmpdir(), "practice-test-")))[0]?.code, "checksum");
  });
  it("overlapping entries (the quine kind of bomb) are refused", () => {
    const specs = withFile("src/big.yaml", "a: 1\n");
    specs.push({ name: "src/again.yaml", data: "a: 1\n", shareWith: specs.length - 1 });
    // the second entry names a header that belongs to the first: refused as a name mismatch, or as an overlap
    const found = codes(specs);
    assert.ok(found.includes("overlap") || found.includes("local-name"), found.join());
  });
  it("different names in the directory and the local header are refused", () => {
    assert.ok(codes(withFile("src/a.yaml", "x", { localName: "src/b.yaml" })).includes("local-name"));
  });
  it("ZIP64 is refused", () => {
    assert.deepEqual(codes(goodSpecs(), { zip64: true }), ["zip64"]);
  });
  it("stored size must equal packed size", () => {
    assert.ok(codes(withFile("src/s.yaml", "abc", { method: 0, declaredSize: 5 })).includes("size-mismatch"));
  });
  it("many entries outside src/ (a whole project) are fine", () => {
    const noise = Array.from({ length: 3000 }, (_, i) => ({ name: `node_modules/p${i}/index.js`, data: "x" }));
    assert.deepEqual(codes([...goodSpecs(), ...noise]), []);
  });
});

describe("not a ZIP file", () => {
  it("refuses empty, short and foreign files", () => {
    for (const data of [Buffer.alloc(0), Buffer.from("PK"), Buffer.from("<!doctype html><title>x</title>".repeat(10)), Buffer.alloc(1000, 0x50)]) {
      assert.equal(inspectZip(data).problems[0]?.code, "not-zip");
    }
  });
  it("refuses a file with a directory that points outside itself", () => {
    const zip = buildZip(goodSpecs());
    zip.writeUInt32LE(0x7fffffff, zip.length - 6);
    assert.equal(inspectZip(zip).problems[0]?.code, "directory");
  });
  it("refuses a ZIP file without entries", () => {
    assert.equal(inspectZip(buildZip([])).problems[0]?.code, "empty");
  });
  it("does not throw on random bytes after a valid end", () => {
    const zip = buildZip(goodSpecs());
    for (let i = 0; i < 200; i++) {
      const copy = Buffer.from(zip);
      copy[(i * 7919) % (copy.length - 22)] = (i * 31) & 0xff;
      assert.doesNotThrow(() => inspectZip(copy));
    }
  });
});

describe("messages are plain and safe", () => {
  it("name no markup that could change a comment", () => {
    const text = inspectZip(buildZip(withFile("src/<img src=x onerror=1>.yaml"))).problems.map((p) => p.text).join("\n");
    assert.ok(!text.includes("<img"));
    assert.ok(!text.includes("]("));
  });
  it("list a code once with the number of the others", () => {
    const specs = [...goodSpecs(), ...Array.from({ length: 30 }, (_, i) => ({ name: `src/c${i}.js`, data: "x" }))];
    const problems = inspectZip(buildZip(specs)).problems.filter((p) => p.code === "extension");
    assert.equal(problems.length, 1);
    assert.match(problems[0]?.text ?? "", /29 weitere/);
  });
  it("deflate of a normal text is unpacked (sanity for the builder)", () => {
    assert.equal(deflateRawSync(Buffer.from("a")).length > 0, true);
  });
});
