/* eslint-env mocha */
const assert = require('assert');
const compare = require('./utils/compare.js');

process.chdir(__dirname);

describe('options', () => {
    it('should take file relatively to "from" option', () => {
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
                encode: false,
                from: './fixtures/index.css'
            }
        );
    });

    it('should take file relatively to "path" option', () => {
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
                encode: false,
                path: './fixtures'
            }
        );
    });

    it('should prefer "path" option over "from"', () => {
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
                encode: false,
                from: './fixtures/deeper/index.css',
                path: './fixtures'
            }
        );
    });

    it('should ignore xmlns absence', () => {
        return compare(
            `background: svg-load('fixtures/basic.svg');`,
            `background: url("data:image/svg+xml;charset=utf-8,%3Csvg id='basic'/%3E");`,
            {
                xmlnsize: false
            }
        );
    });

    it('should skip adding of xmlns if it is present in file', () => {
        return compare(
            `background: svg-load('fixtures/basic-with-xmlns.svg');`,
            `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic-with-xmls'/>");`,
            {
                encode: false
            }
        );
    });

    it('should transform result svg into url', () => {
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
                encode: false,
                xmlnsize: false,
                transform(result, file) {
                    assert.equal(result, '<svg id="basic" fill="#fff"/>');
                    return file.split(/\\|\//).pop() + ': transformed content';
                }
            }
        );
    });

    it('should encode result svg', () => {
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
            {}
        );
    });

    it('should encode result svg with custom encoder', () => {
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
                encode(code) {
                    assert.equal(code, `<svg xmlns="http://www.w3.org/2000/svg" id="basic"/>`);
                    return '1234567890';
                }
            }
        );
    });

    it('should combine results of "encode" and "transform"', () => {
        return compare(
            `background: svg-load('fixtures/basic.svg');`,
            `background: url([transform: encode]);`,
            {
                encode() {
                    return 'encode';
                },
                transform(code) {
                    return `[transform: ${code}]`;
                }
            }
        );
    });

    it('should remove fill attributes with removeFill: true', () => {
        return compare(
            `background: svg-load('fixtures/fill.svg', fill="#fff");`,
            `background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' fill='#fff'> <path/> </svg>");`,
            {
                removeFill: true,
                encode: false
            }
        );
    });

    it('should remove fill attributes with removeFill: RegExp', () => {
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
                removeFill: /-icon/,
                encode: false
            }
        );
    });
});
