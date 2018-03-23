/* eslint-env mocha */
const path = require("path");
const { compare } = require("./utils.js");

process.chdir(__dirname);

describe("cases", () => {
  it("should resolve quotes in transform step", () => {
    return compare(
      `background: svg-load('fixtures/font.svg');`,
      `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' font='%22Nelvetica Neue%22, sans-serif'/>");`,
      { from: "input.css", encode: false }
    );
  });

  it("should stringify all values after ast transformation", () => {
    return compare(
      `
      @svg-load icon url(fixtures/basic.svg) {}
      background: svg-inline(icon);
      background: svg-load('fixtures/basic.svg');
      `,
      `
      background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
      background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
      `,
      { from: "input.css", encode: false }
    ).then(result => {
      result.root.walkDecls(decl => {
        expect(typeof decl.value).toEqual("string");
      });
    });
  });

  it("should warn on not found file", () => {
    return compare(
      `background: svg-load('fixtures/not-found.svg');`,
      `background: svg-load('fixtures/not-found.svg');`,
      { from: "input.css", encode: false },
      [`Can't load '${path.resolve("fixtures/not-found.svg")}'`]
    );
  });

  it("should add message about dependency", () => {
    return compare(
      `
      background: svg-load('fixtures/basic.svg');
      @svg-load icon url('fixtures/basic-black.svg') {}
      `,
      `
      background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>")
      `,
      { from: "input.css", encode: false }
    ).then(result => {
      const messages = result.messages
        .filter(message => message.type === "dependency")
        .map(message => [message.file, message.parent])
        .sort();
      expect(messages).toEqual([
        [path.resolve("fixtures/basic-black.svg"), path.resolve("input.css")],
        [path.resolve("fixtures/basic.svg"), path.resolve("input.css")]
      ]);
    });
  });

  it("should not add message about not found dependency", () => {
    return compare(
      `
      background: svg-load('fixtures/not-found.svg');
      @svg-load icon url('fixtures/not-found.svg') {}
      `,
      `
      background: svg-load('fixtures/not-found.svg');
      @svg-load icon url('fixtures/not-found.svg') {}
      `,
      { from: "input.css", encode: false },
      [
        `Can't load '${path.resolve("fixtures/not-found.svg")}'`,
        `Can't load '${path.resolve("fixtures/not-found.svg")}'`
      ]
    ).then(result => {
      const messages = result.messages
        .filter(message => message.type === "dependency")
        .map(message => message.file)
        .sort();
      expect(messages).toEqual([]);
    });
  });

  it("should add parent in dependency message if specified", () => {
    return compare(
      `
      background: svg-load('basic.svg');
      @svg-load icon url('basic-black.svg') {}
      `,
      `
      background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>")
      `,
      { from: "fixtures/file.css", encode: false }
    ).then(result => {
      const messages = result.messages
        .filter(message => message.type === "dependency")
        .map(message => message.parent)
        .sort();
      expect(messages).toEqual([
        path.resolve("fixtures/file.css"),
        path.resolve("fixtures/file.css")
      ]);
    });
  });
});
