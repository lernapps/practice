import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chooseZipUrl, cleanSubject, isSubmission, readDeclarations, readMeta, readZipUrl, sections } from "../actions/lib/form.ts";
import { issueBody, URL1 } from "./support.ts";

describe("the text of an issue from the form", () => {
  it("is recognised by all five headings", () => {
    assert.ok(isSubmission(issueBody()));
    assert.ok(!isSubmission("### Fach\n\nx"));
    assert.ok(!isSubmission("Hallo, ich habe eine Frage."));
    assert.ok(!isSubmission(issueBody().replace("### Bundesland", "### Land")));
  });
  it("is read with Windows line ends too", () => {
    assert.equal(sections(issueBody().replaceAll("\n", "\r\n"))["Fach"], "Religion");
  });
  it("keeps the first of a heading that appears twice (text typed into a field cannot replace a field)", () => {
    assert.equal(sections(`${issueBody()}\n\n### Fach\n\nBöse`)["Fach"], "Religion");
  });
});

describe("the fields", () => {
  it("are read", () => {
    const { meta, problems } = readMeta(sections(issueBody()));
    assert.deepEqual(problems, []);
    assert.deepEqual(meta, { fach: "Religion", klassenstufe: "7", bundesland: "Hessen" });
  });
  it("must come from the lists", () => {
    for (const bad of [{ Klassenstufe: "14" }, { Klassenstufe: "0" }, { Klassenstufe: "07" }, { Klassenstufe: "7; rm -rf" }, { Bundesland: "Atlantis" }, { Bundesland: "hessen" }]) {
      const { problems } = readMeta(sections(issueBody(bad)));
      assert.ok(problems.length > 0, JSON.stringify(bad));
    }
  });
  it("accept all grades and all states", () => {
    for (let grade = 1; grade <= 13; grade++) assert.deepEqual(readMeta(sections(issueBody({ Klassenstufe: String(grade) }))).problems, []);
    for (const state of ["Baden-Württemberg", "Thüringen", "Mecklenburg-Vorpommern"]) {
      assert.deepEqual(readMeta(sections(issueBody({ Bundesland: state }))).problems, []);
    }
  });
  it("need a subject, and not »_No response_«", () => {
    assert.ok(readMeta(sections(issueBody({ Fach: "" }))).problems.length > 0);
    assert.ok(readMeta(sections(issueBody({ Fach: "_No response_" }))).problems.length > 0);
  });
  it("keep the subject short and free of control characters", () => {
    assert.equal(cleanSubject("  Mathe\u0000‮  \n Klasse\t7 "), "Mathe Klasse 7");
    assert.ok(readMeta(sections(issueBody({ Fach: "x".repeat(61) }))).problems.length > 0);
    assert.deepEqual(readMeta(sections(issueBody({ Fach: "x".repeat(60) }))).problems, []);
    assert.equal(cleanSubject("Mäthe"), "Mäthe");
  });
  it("all three declarations must be ticked", () => {
    assert.deepEqual(readDeclarations(sections(issueBody())), []);
    assert.equal(readDeclarations(sections(issueBody({ Erklärungen: "- [x] a\n- [ ] b\n- [x] c" }))).length, 1);
    assert.equal(readDeclarations(sections(issueBody({ Erklärungen: "- [x] a" }))).length, 1);
    assert.equal(readDeclarations(sections(issueBody({ Erklärungen: "_No response_" }))).length, 1);
  });
});

describe("the ZIP address", () => {
  const url = (field: string) => readZipUrl(sections(issueBody({ "ZIP-Datei": field })));
  it("is found in the link GitHub writes", () => {
    assert.equal(url(`[vorbereitung.zip](${URL1})`).url, URL1);
    assert.equal(url(URL1).url, URL1);
  });
  it("accepts only the attachment store of GitHub", () => {
    for (const bad of [
      "https://evil.example/user-attachments/files/1/a.zip",
      "http://github.com/user-attachments/files/1/a.zip",
      "https://github.com.evil.example/user-attachments/files/1/a.zip",
      "https://github.com/user-attachments/assets/1/a.zip",
      "https://github.com/user-attachments/files/abc/a.zip",
      "https://github.com/user-attachments/files/1/a.exe",
      "https://github.com/user-attachments/files/1/a.zip.exe",
      "https://github.com/lernapps/practice/archive/main.zip",
      "https://raw.githubusercontent.com/x/y/main/a.zip",
    ]) {
      const result = url(bad);
      assert.equal(result.url, undefined, bad);
      assert.equal(result.problems[0]?.code, "zip-missing", bad);
    }
  });
  it("says how to attach when there is none, with the sentence the clients expect", () => {
    const result = url("");
    assert.match(result.problems[0]?.text ?? "", /^Kein ZIP gefunden\. So hängst Du es an:/);
  });
  it("refuses several different ZIP files", () => {
    assert.equal(url(`${URL1} https://github.com/user-attachments/files/2/b.zip`).problems[0]?.code, "zip-several");
    assert.equal(url(`${URL1} ${URL1}`).url, URL1);
  });
});

describe("the ZIP file that counts", () => {
  const NEWER = "https://github.com/user-attachments/files/34026999/neu.zip";
  const OLDER = "https://github.com/user-attachments/files/34000000/alt.zip";
  const field = (zip: string) => sections(issueBody({ "ZIP-Datei": zip }));
  it("is the field's when the author commented no ZIP file", () => {
    assert.equal(chooseZipUrl(field(URL1), ["Danke!"]).url, URL1);
  });
  it("is a newer upload in a comment of the author, the latest of several", () => {
    assert.equal(chooseZipUrl(field(URL1), [`[a.zip](${OLDER})`, `[neu.zip](${NEWER})`, "noch eine Frage"]).url, NEWER);
  });
  it("stays the field's when the field holds the later upload", () => {
    assert.equal(chooseZipUrl(field(NEWER), [`[alt.zip](${OLDER})`]).url, NEWER);
  });
  it("comes from a comment when the field has none, without the help text", () => {
    const result = chooseZipUrl(field("_No response_"), [`[neu.zip](${NEWER})`]);
    assert.equal(result.url, NEWER);
    assert.deepEqual(result.problems, []);
  });
  it("takes only attachment addresses from comments", () => {
    assert.equal(chooseZipUrl(field(URL1), ["https://evil.example/user-attachments/files/99999999/a.zip"]).url, URL1);
  });
});
