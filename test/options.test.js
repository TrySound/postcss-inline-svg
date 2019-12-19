/* eslint-env mocha */
const { resolve } = require("path");
const { compare } = require("./utils.js");

process.chdir(__dirname);

test('should take file relatively to "from" option', () => {
  return compare(
    `
    @svg-load icon url(basic.svg) {}
    background: svg-load('basic.svg');
    background: svg-inline(icon);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    `,
    { from: "./fixtures/index.css", encode: false }
  );
});

test('should take file relatively to "paths" option', () => {
  return compare(
    `
    @svg-load icon url(basic.svg) {}
    background: svg-load('basic.svg');
    background: svg-inline(icon);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    `,
    { from: "input.css", paths: ["./fixtures"], encode: false }
  );
});

test('should resolve file using "paths" option as a function', () => {
  return compare(
    `
    @svg-load icon url(basic.svg) {}
    background: svg-load('basic.svg');
    background: svg-inline(icon);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    `,
    {
      from: "input.css",
      paths: (file, url, opts) => resolve("fixtures", url),
      encode: false
    }
  );
});

test('should find existing path from "paths" option', () => {
  return compare(
    `
    @svg-load icon url(basic.svg) {}
    background: svg-load('basic.svg');
    background: svg-inline(icon);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    `,
    {
      from: "input.css",
      paths: ["./does_not_exist", "./fixtures"],
      encode: false
    }
  );
});

test('should prefer "paths" option over "from"', () => {
  return compare(
    `
    @svg-load icon url(basic.svg) {}
    background: svg-load('basic.svg');
    background: svg-inline(icon);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    `,
    {
      from: "./fixtures/deeper/index.css",
      paths: ["./fixtures"],
      encode: false
    }
  );
});

test("should ignore xmlns absence", () => {
  return compare(
    `background: svg-load('fixtures/basic.svg');`,
    `background: url("data:image/svg+xml;charset=utf-8,%3Csvg id='basic'/%3E");`,
    { from: "input.css", xmlns: false }
  );
});

test("should skip adding of xmlns if it is present in file", () => {
  return compare(
    `background: svg-load('fixtures/basic-with-xmlns.svg');`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic-with-xmls'/>");`,
    { from: "input.css", encode: false }
  );
});

test("should transform result svg into url", () => {
  return compare(
    `
    @svg-load icon url(fixtures/basic.svg) {
        fill: #fff;
    }
    background: svg-load('fixtures/basic.svg', fill=#fff);
    background: svg-inline(icon);
    `,
    `
    background: url(basic.svg: transformed content);
    background: url(basic.svg: transformed content);
    `,
    {
      from: "input.css",
      encode: false,
      xmlns: false,
      transform(result, file) {
        expect(result).toEqual('<svg id="basic" fill="#fff"/>');
        return file.split(/\\|\//).pop() + ": transformed content";
      }
    }
  );
});

test("should encode result svg", () => {
  return compare(
    `
    @svg-load icon url(fixtures/basic.svg) {}
    background: svg-load('fixtures/basic.svg');
    background: svg-inline(icon);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/%3E");
    background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/%3E");
    `,
    { from: "input.css" }
  );
});

test("should encode result svg with custom encoder", () => {
  return compare(
    `
    @svg-load icon url(fixtures/basic.svg) {}
    background: svg-load('fixtures/basic.svg');
    background: svg-inline(icon);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,1234567890");
    background: url("data:image/svg+xml;charset=utf-8,1234567890");
    `,
    {
      from: "input.css",
      encode(code) {
        expect(code).toEqual(
          `<svg xmlns="http://www.w3.org/2000/svg" id="basic"/>`
        );
        return "1234567890";
      }
    }
  );
});

test('should combine results of "encode" and "transform"', () => {
  return compare(
    `background: svg-load('fixtures/basic.svg');`,
    `background: url([transform: encode]);`,
    {
      from: "input.css",
      encode() {
        return "encode";
      },
      transform(code) {
        return `[transform: ${code}]`;
      }
    }
  );
});

test("should remove fill attributes with removeFill: true", () => {
  return compare(
    `background: svg-load('fixtures/fill.svg', fill="#fff");`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' fill='#fff'> <path/> </svg>");`,
    {
      from: "input.css",
      removeFill: true,
      encode: false
    }
  );
});

test("should remove fill attributes with removeFill: RegExp", () => {
  return compare(
    `
    background: svg-load('fixtures/fill.svg', fill="#fff");
    background: svg-load('fixtures/fill-icon.svg', fill="#fff");
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' fill='#fff'> <path fill='#000'/> </svg>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' fill='#fff'> <rect/> </svg>");
    `,
    {
      from: "input.css",
      removeFill: /-icon/,
      encode: false
    }
  );
});

test("should remove stroke attributes with removeStroke: true", () => {
  return compare(
    `background: svg-load('fixtures/stroke.svg', stroke="#fff");`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' stroke='#fff'> <path/> </svg>");`,
    {
      from: "input.css",
      removeStroke: true,
      encode: false
    }
  );
});

test("should remove stroke attributes with removeStroke: RegExp", () => {
  return compare(
    `
    background: svg-load('fixtures/stroke.svg', stroke="#fff");
    background: svg-load('fixtures/stroke-icon.svg', stroke="#fff");
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' stroke='#fff'> <path stroke='#000'/> </svg>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' stroke='#fff'> <rect/> </svg>");
    `,
    {
      from: "input.css",
      removeStroke: /-icon/,
      encode: false
    }
  );
});
