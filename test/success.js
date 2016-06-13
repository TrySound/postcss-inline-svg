import test from 'ava';
import postcss from 'postcss';
import plugin from '..';

/* eslint-disable max-len */
let tests = [{
    fixture: '@svg-load nav url(nested-icon.svg){}h1{background:svg-load(nested-icon.svg)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 50 50\'><path/></svg>")}',
    options: {
        encode: false,
        path: './svg/nested-path'
    }
}, {
    fixture: '@svg-load nav url(nested-path/nested-icon.svg){}h1{background:svg-load(nested-path/nested-icon.svg)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 50 50\'><path/></svg>")}',
    options: {
        encode: false,
        from: './svg/index.css'
    }
}, {
    fixture: '@svg-load nav url(svg/nested-path/nested-icon.svg){}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 50 50\'><path/></svg>")}',
    options: {
        encode: false,
        from: './index.css'
    }
}, {
    fixture: '@svg-load nav url(svg/nested-path/nested-icon.svg){}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 50 50\'><path/></svg>")}',
    options: {
        encode: false,
        from: './svg/index.css',
        path: '.'
    }
}, {
    fixture: '@svg-load nav url(svg/nav.svg){}h1{background:svg-inline(nav)}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url(nav.svg: transformed content)}h1{background:url(nested-icon.svg: transformed content)}',
    options: {
        transform(result, path) {
            return path.split(/\\|\//).pop() + ': transformed content';
        }
    }
}];
/* eslint-enable max-len */

tests.forEach((item, i) => {
    test(`#${i + 1}`, t => {
        return postcss([
            plugin(item.options)
        ]).process(item.fixture, item.options).then(result => {
            result.warnings().forEach(warning => {
                t.is(warning, undefined);
            });
            t.is(result.css, item.expected);
        });
    });
});
