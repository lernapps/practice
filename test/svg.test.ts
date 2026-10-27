// The content check of SVG images (actions/lib/svg.ts): a drawing passes, anything that runs or loads is refused.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeReferences, svgProblems } from "../actions/lib/svg.ts";

const codes = (text: string) => svgProblems("src/images/x.svg", Buffer.from(text)).map((p) => p.code);
const svg = (inner: string, attributes = "") =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100"${attributes}>${inner}</svg>`;

describe("an SVG drawing", () => {
  it("passes with shapes, text, styles, gradients and references inside the file", () => {
    const drawing = svg(
      '<defs><linearGradient id="g"><stop offset="0"/></linearGradient><marker id="pfeil"><path d="M0 0L5 5"/></marker></defs>' +
        '<style>.a { fill: url(#g); stroke-linejoin: round }</style>' +
        '<rect class="a" width="10" height="10" fill="url(#g)"/><use href="#pfeil"/><use xlink:href="#pfeil"/>' +
        '<text x="5" y="5" font-size="4">Zähler &#176; online: siehe https://de.wikipedia.org</text><!-- eigene Zeichnung -->',
      ' role="img" aria-label="Kreis"',
    );
    assert.deepEqual(codes(drawing), []);
  });
});

describe("an SVG image is refused", () => {
  const cases: [string, string, string][] = [
    ["a script", svg("<script>alert(1)</script>"), "svg-script"],
    ["a script in another case", svg("<SCRIPT >alert(1)</SCRIPT>"), "svg-script"],
    ["an event attribute", svg('<rect onclick="alert(1)"/>'), "svg-event"],
    ["an event attribute on the root", svg("", ' onload="alert(1)"'), "svg-event"],
    ["an event attribute without quotes", svg("<rect onmouseover=alert(1) />"), "svg-event"],
    ["an event attribute after a slash", svg('<rect/onclick="x"/>'), "svg-event"],
    ["a foreignObject", svg("<foreignObject><div/></foreignObject>"), "svg-foreign-object"],
    ["an iframe", svg('<iframe src="x"/>'), "svg-embedded"],
    ["an embed", svg('<embed src="x"/>'), "svg-embedded"],
    ["an object", svg('<object data="x"/>'), "svg-embedded"],
    ["javascript: in a link", svg('<a href="javascript:alert(1)"><text>x</text></a>'), "svg-javascript"],
    ["javascript: hidden by references", svg('<a href="&#106;ava&#x73;cript:alert(1)">x</a>'), "svg-javascript"],
    ["javascript: split by a tab", svg('<a href="java&#9;script:alert(1)">x</a>'), "svg-javascript"],
    ["an external image", svg('<image href="https://example.org/a.png"/>'), "svg-external"],
    ["an external xlink:href", svg('<use xlink:href="other.svg#a"/>'), "svg-external"],
    ["an external url() in a style", svg('<style>rect { fill: url("https://example.org/x") }</style>'), "svg-external"],
    ["an external url() in an attribute", svg('<rect filter="url(other.svg#f)"/>'), "svg-external"],
    ["an @import", svg("<style>@import 'x.css';</style>"), "svg-external"],
    ["a data: address", svg('<image href="data:image/svg+xml;base64,AAAA"/>'), "svg-external"],
    ["an address in an animation", svg('<a><set attributeName="href" to="https://example.org"/></a>'), "svg-external"],
    ["an entity definition", `<!DOCTYPE svg [<!ENTITY x "y">]>${svg("")}`, "svg-entity"],
  ];
  for (const [name, text, code] of cases) {
    it(`with ${name}`, () => {
      assert.ok(codes(text).includes(code), `${codes(text).join(", ")}`);
    });
  }

  it("when it is not an SVG, or not UTF-8", () => {
    assert.deepEqual(codes("<html><body/></html>"), ["svg-not-svg"]);
    assert.deepEqual(svgProblems("x.svg", Buffer.from([0x3c, 0x73, 0x76, 0x67, 0xff, 0xfe])).map((p) => p.code), ["svg-encoding"]);
  });

  it("with a message in plain German that names the file and says what to remove", () => {
    const [problem] = svgProblems("src/images/bild.svg", Buffer.from(svg("<script>x</script>")));
    assert.match(problem?.text ?? "", /^Das Bild `src\/images\/bild\.svg` enthält ein Skript/);
    assert.match(problem?.text ?? "", /Entferne das/);
  });

  it("once per kind, however often it occurs", () => {
    assert.deepEqual(codes(svg('<rect onclick="a"/><rect onload="b"/>')), ["svg-event"]);
  });
});

describe("decodeReferences", () => {
  it("decodes numeric references and the XML entities, and drops impossible ones", () => {
    assert.equal(decodeReferences("&#106;&#x61;&lt;&amp;&#0;&#x110000;"), "ja<&");
  });
});
