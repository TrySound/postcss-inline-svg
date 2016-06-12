const test = require('ava');
const assert = require('assert');
const postcss = require('postcss');
const plugin = require('../');

function compare(fixture, expected, options = { encode: false, warnings: [] }) {
    return postcss([
        plugin(options)
    ]).process(fixture, options).then(result => {
        result.warnings().forEach((warning, index) => {
            assert.equal(options.warnings[index], warning.text);
        });
        assert.equal(result.css, expected);
    });
}

test('should compile basic', () => {
    return compare(
        `background: svg-load('fixtures/basic.svg');`,
        `background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");`
    );
});

test('should compile unquoted path', () => {
    return compare(
        `background: svg-load(fixtures/basic.svg);`,
        `background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");`
    );
});

test('should skip unexpected function syntax', () => {
    const fixtures = `
        background: svg-load();
        background: svg-load('fixtures/basic.svg', );
    `;
    return compare(
        fixtures,
        fixtures,
        {
            warnings: [
                'Invalid "svg-load()" definition',
                'Invalid "svg-load()" definition'
            ]
        }
    );
});

test('should compile fill param', () => {
    return compare(
        `background: svg-load('fixtures/basic.svg', fill=#fff);`,
        `background: url("data:image/svg+xml;charset=utf-8,<svg id='basic' fill='#fff'/>");`
    );
});

test('should compile unquoted path with param', () => {
    return compare(
        `background: svg-load(fixtures/basic.svg, fill=#fff);`,
        `background: url("data:image/svg+xml;charset=utf-8,<svg id='basic' fill='#fff'/>");`
    );
});

test('should compile fill and stroke param', () => {
    return compare(
        `background: svg-load('fixtures/basic.svg', fill=#fff, stroke=#000);`,
        `background: url("data:image/svg+xml;charset=utf-8,<svg id='basic' fill='#fff' stroke='#000'/>");`
    );
});

test('should compile fill param with colon syntax', () => {
    return compare(
        `background: svg-load('fixtures/basic.svg', fill: #fff);`,
        `background: url("data:image/svg+xml;charset=utf-8,<svg id='basic' fill='#fff'/>");`
    );
});

test('should skip param with unexpected separator', () => {
    const fixtures = `
        background: svg-load('fixtures/basic.svg', fill: #fff, stroke=#000);
        background: svg-load('fixtures/basic.svg', fill=#fff, stroke: #000);
        background: svg-load('fixtures/basic.svg', fill #fff);
        background: svg-load('fixtures/basic.svg', fill-#fff);
    `;
    return compare(
        fixtures,
        fixtures,
        {
            warnings: [
                'Expected ":" separator in "stroke=#000"',
                'Expected "=" separator in "stroke: #000"',
                'Expected ":" or "=" separator in "fill #fff"',
                'Expected ":" or "=" separator in "fill-#fff"'
            ]
        }
    );
});

test('should override fill param', () => {
    return compare(
        `background: svg-load('fixtures/basic-black.svg', fill=#fff);`,
        `background: url("data:image/svg+xml;charset=utf-8,<svg id='basic-black' fill='#fff'/>");`
    );
});
