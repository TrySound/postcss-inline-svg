import test from 'ava';
import postcss from 'postcss';
import plugin from '..';

/* eslint-disable max-len */
let tests = [{
    fixture: '@svg-load nav url(svg/nav.svg) {path:nth-child(2){fill:#0ff};}h1{background:svg-inline(nav)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 50 50\'><path d=\'M10 12h30v4H10z\'/><path d=\'M10 22h30v4H10z\' fill=\'#0ff\'/><path d=\'M10 32h30v4H10z\'/></svg>")}',
    options: {
        encode: false
    }
}, {
    fixture: 'h1{background:svg-load(svg/up.svg, fill: #000, stroke: #fff)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,<?xml version=\'1.0\' encoding=\'utf-8\'?> <svg version=\'1.1\' id=\'Capa_1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' x=\'0px\' y=\'0px\' width=\'612px\' height=\'612px\' viewBox=\'8 205.9 612 612\' enable-background=\'new 8 205.9 612 612\' xml:space=\'preserve\' fill=\'#000\' stroke=\'#fff\'> <path d=\'M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9 z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z\'/> </svg>")}',
    options: {
        encode: false
    }
}, {
    fixture: 'h1{background:svg-load(svg/up.svg, fill=#000, stroke= #fff, rock =#f0f)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,<?xml version=\'1.0\' encoding=\'utf-8\'?> <svg version=\'1.1\' id=\'Capa_1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' x=\'0px\' y=\'0px\' width=\'612px\' height=\'612px\' viewBox=\'8 205.9 612 612\' enable-background=\'new 8 205.9 612 612\' xml:space=\'preserve\' fill=\'#000\' stroke=\'#fff\' rock=\'#f0f\'> <path d=\'M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9 z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z\'/> </svg>")}',
    options: {
        encode: false
    }
}, {
    fixture: [
        'h1{background:svg-load(svg/up.svg, fill: #000, stroke: #fff)}',
        'h1{background:svg-load(svg/up.svg, fill: #fff, stroke: #000)}'
    ].join(''),
    expected: [
        'h1{background:url("data:image/svg+xml;charset=utf-8,<?xml version=\'1.0\' encoding=\'utf-8\'?> <svg version=\'1.1\' id=\'Capa_1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' x=\'0px\' y=\'0px\' width=\'612px\' height=\'612px\' viewBox=\'8 205.9 612 612\' enable-background=\'new 8 205.9 612 612\' xml:space=\'preserve\' fill=\'#000\' stroke=\'#fff\'> <path d=\'M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9 z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z\'/> </svg>")}',
        'h1{background:url("data:image/svg+xml;charset=utf-8,<?xml version=\'1.0\' encoding=\'utf-8\'?> <svg version=\'1.1\' id=\'Capa_1\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' x=\'0px\' y=\'0px\' width=\'612px\' height=\'612px\' viewBox=\'8 205.9 612 612\' enable-background=\'new 8 205.9 612 612\' xml:space=\'preserve\' fill=\'#fff\' stroke=\'#000\'> <path d=\'M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9 z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z\'/> </svg>")}'
    ].join(''),
    options: {
        encode: false
    }
}, {
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
        encode: false
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
    fixture: '@svg-load nav url(svg/nested-path/nested-icon.svg){}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 50 50\'%3E%3Cpath/%3E%3C/svg%3E")}'
}, {
    fixture: '@svg-load nav url(svg/nav.svg){}h1{background:svg-inline(nav)}h1{background:svg-load(svg/nested-path/nested-icon.svg)}',
    expected: 'h1{background:url(nav.svg: transformed content)}h1{background:url(nested-icon.svg: transformed content)}',
    options: {
        transform: function (result, path) {
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
            result.warnings().forEach(function (warning) {
                t.is(warning, undefined);
            });
            t.is(result.css, item.expected);
        });
    });
});
