const { compare } = require("./utils.js");

process.chdir(__dirname);

test("should compile basic", () => {
  return compare(
    `background: svg-load('fixtures/basic.svg');`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");`,
    { from: "input.css", encode: false }
  );
});

test("should skip unexpected function syntax", () => {
  const fixtures = `
    background: svg-load();
    background: svg-load('fixtures/basic.svg', );
    background: svg-load(a'fixtures/basic.svg');
    background: svg-load(,'fixtures/basic.svg');
  `;
  return compare(fixtures, fixtures, { from: "input.css", encode: false }, [
    `Invalid "svg-load()" statement`,
    `Expected parameter`,
    `Invalid "svg-load(a'fixtures/basic.svg')" definition`,
    `Invalid "svg-load(,'fixtures/basic.svg')" definition`,
  ]);
});

test("should compile fill param", () => {
  return compare(
    `background: svg-load('fixtures/basic.svg', fill=#fff);`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic' fill='#fff'/>");`,
    { from: "input.css", encode: false }
  );
});

test("should compile unquoted path", () => {
  return compare(
    `
    background: svg-load(fixtures/basic.svg);
    background: svg-load(fixtures/basic.svg, fill=#fff);
    `,
    `
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
    background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic' fill='#fff'/>");
    `,
    { from: "input.css", encode: false }
  );
});

test("should compile fill and stroke param", () => {
  return compare(
    `background: svg-load('fixtures/basic.svg', fill=#fff, stroke=#000);`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic' fill='#fff' stroke='#000'/>");`,
    { from: "input.css", encode: false }
  );
});

test("should compile fill param with colon syntax", () => {
  return compare(
    `background: svg-load('fixtures/basic.svg', fill: #fff);`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic' fill='#fff'/>");`,
    { from: "input.css", encode: false }
  );
});

test("should skip param with unexpected separator", () => {
  const fixtures = `
    background: svg-load('fixtures/basic.svg', fill: #fff, stroke=#000);
    background: svg-load('fixtures/basic.svg', fill=#fff, stroke: #000);
    background: svg-load('fixtures/basic.svg', fill::#fff);
    background: svg-load('fixtures/basic.svg', fill #fff);
    background: svg-load('fixtures/basic.svg', fill-#fff);
    background: svg-load('fixtures/basic.svg', fn());
  `;
  return compare(fixtures, fixtures, { from: "input.css", encode: false }, [
    'Expected ":" separator in "stroke=#000"',
    'Expected "=" separator in "stroke: #000"',
    'Expected ":" separator in "fill::#fff"',
    'Expected ":" or "=" separator in "fill #fff"',
    'Expected ":" or "=" separator in "fill-#fff"',
    'Expected ":" or "=" separator in "fn()"',
  ]);
});

test("should override fill param", () => {
  return compare(
    `background: svg-load('fixtures/basic-black.svg', fill=#fff);`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic-black' fill='#fff'/>");`,
    { from: "input.css", encode: false }
  );
});

test("should compile color functions", () => {
  return compare(
    `background: svg-load('fixtures/basic.svg', fill=rgb(255, 0, 0));`,
    `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic' fill='rgb(255, 0, 0)'/>");`,
    { from: "input.css", encode: false }
  );
});
