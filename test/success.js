import test from 'ava';
import postcss from 'postcss';
import plugin from '..';

/* eslint-disable max-len */
let tests = [{
    fixture: '@svg-load nav url(svg/nav.svg) {path:nth-child(2){fill:#0ff};}h1{background:svg-inline(nav)}',
    expected: 'h1{background:url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M10 12h30v4H10z"/><path d="M10 22h30v4H10z" fill="#0ff"/><path d="M10 32h30v4H10z"/></svg>\')}'
}, {
    fixture: 'h1{background:svg-load(svg/up.svg, fill: #000, stroke: #fff)}',
    expected: 'h1{background:url(\'data:image/svg+xml;charset=utf-8,<?xml version="1.0" encoding="utf-8"?> <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612" enable-background="new 8 205.9 612 612" xml:space="preserve" fill="#000" stroke="#fff"> <path d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9 \tz M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z"/> </svg>\')}'
}, {
    fixture: '@svg-load nav url(nested-icon.svg){}h1{background:svg-load(nested-icon.svg)}',
    expected: 'h1{background:url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path/></svg>\')}',
    options: {
        path: './svg/nested-path'
    }
}, {
    fixture: '@svg-load nav url(nested-path/nested-icon.svg){}h1{background:svg-load(nested-path/nested-icon.svg)}',
    expected: 'h1{background:url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path/></svg>\')}',
    options: {
        from: './svg/index.css'
    }
}, {
    fixture: '@svg-load nav url(svg/nested-path/nested-icon.svg){}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path/></svg>\')}',
    options: {
        from: './index.css'
    }
}, {
    fixture: '@svg-load nav url(svg/nested-path/nested-icon.svg){}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path/></svg>\')}'
}, {
    fixture: '@svg-load nav url(svg/nested-path/nested-icon.svg){}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url(\'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path/></svg>\')}',
    options: {
        from: './svg/index.css',
        path: '.'
    }
}];
/* eslint-enable max-len */

test('postcss-inline-svg', t => {
    return Promise.all(tests.map(item => {
        return postcss([
            plugin(item.options)
        ]).process(item.fixture, item.options).then(function (result) {
            t.is(result.css, item.expected);
        });
    }));
});
