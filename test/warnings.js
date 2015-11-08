import test from 'ava';
import postcss from 'postcss';
import plugin from '..';

/* eslint-disable max-len */
let tests = [{
    fixture: '@svg-load nav url() {}',
    expected: '',
    warning: 'Invalid @svg-load definition'
}, {
    fixture: '@svg-load {}',
    expected: '',
    warning: 'Invalid @svg-load definition'
}];
/* eslint-enable max-len */

test('postcss-inline-svg', t => {
    return Promise.all(tests.map(item => {
        return postcss([
            plugin(item.options)
        ]).process(item.fixture, item.options).then(function (result) {
            t.is(result.warnings()[0].text, item.warning);
            t.is(result.css, item.expected);
        });
    }));
});
