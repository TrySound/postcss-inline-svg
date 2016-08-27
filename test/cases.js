const path = require('path');
const assert = require('assert');
const compare = require('./utils/compare.js');

process.chdir(__dirname);

describe('cases', () => {
    it('should resolve quotes in transform step', () => {
        return compare(
            `background: svg-load('fixtures/font.svg');`,
            `background: url("data:image/svg+xml;charset=utf-8,<svg font='%22Nelvetica Neue%22, sans-serif'/>");`
        );
    });

    it('should stringify all values after ast transformation', () => {
        return compare(
            `
            @svg-load icon url(fixtures/basic.svg) {}
            background: svg-inline(icon);
            background: svg-load('fixtures/basic.svg');
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            background: url("data:image/svg+xml;charset=utf-8,<svg id='basic'/>");
            `
        ).then(result => {
            result.root.walkDecls(decl => {
                assert.equal(typeof decl.value, 'string');
            });
        });
    });

    it('should warn on not found file', () => {
        return compare(
            `background: svg-load('fixtures/not-found.svg');`,
            `background: svg-load('fixtures/not-found.svg');`,
            [
                `ENOENT: no such file or directory, open '${path.resolve('fixtures/not-found.svg')}'`
            ]
        );
    });
});
