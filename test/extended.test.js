/* eslint-env mocha */
const compare = require('./utils/compare.js');

process.chdir(__dirname);

describe('extended syntax', () => {
    it('should compile basic', () => {
        return compare(
            `
            @svg-load icon url(fixtures/basic.svg) {}
            @svg-load icon2 url('fixtures/basic.svg') {}
            background: svg-inline(icon);
            background: svg-inline(icon2);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
            background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic'/>");
            `
        );
    });

    it('should skip invalid syntax', () => {
        const fixtures = `
            @svg-load {}
            @svg-load url() {}
            @svg-load icon {}
            @svg-load icon url() {}
            background: svg-inline();
        `;
        return compare(
            fixtures,
            fixtures,
            [
                'Invalid "@svg-load" definition',
                'Invalid "@svg-load" definition',
                'Invalid "@svg-load" definition',
                'Invalid "@svg-load" definition',
                'Invalid "svg-inline()" statement'
            ]
        );
    });

    it('should skip if svg is not defined', () => {
        const fixtures = `
            background: svg-inline(icon);
            background: svg-inline(icon2);
        `;
        return compare(
            fixtures,
            fixtures,
            [
                '"icon" svg is not defined',
                '"icon2" svg is not defined'
            ]
        );
    });

    it('should apply root params', () => {
        return compare(
            `
            @svg-load icon url(fixtures/basic.svg) {
                fill: #fff;
                stroke: #000;
            }
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic' fill='#fff' stroke='#000'/>");
            `
        );
    });

    it('should rewrite root params', () => {
        return compare(
            `
            @svg-load icon url(fixtures/basic-black.svg) {
                fill: #fff;
                stroke: #000;
            }
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='basic-black' fill='#fff' stroke='#000'/>");
            `
        );
    });

    it('should apply params by tag', () => {
        return compare(
            `
            @svg-load icon url(fixtures/path.svg) {
                path {
                    fill: #fff;
                }
            }
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='path'><path class='g1' fill='#fff'/><path class='g1' fill='#fff'/><path fill='#fff'/></svg>");
            `
        );
    });

    it('should apply params by className', () => {
        return compare(
            `
            @svg-load icon url(fixtures/path.svg) {
                .g1 {
                    fill: #fff;
                }
            }
            background: svg-inline(icon);
            `,
            `
            background: url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' id='path'><path class='g1' fill='#fff'/><path class='g1' fill='#fff'/><path fill='#000'/></svg>");
            `
        );
    });
});
