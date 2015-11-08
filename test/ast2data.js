import test from 'ava';
import postcss from 'postcss';
import ast2data from '../lib/ast2data';

let tests = [{
    fixture: `
        fill: #000;
        stroke: #fff;
    `,
    expected: {
        root: {
            fill: '#000',
            stroke: '#fff'
        },
        selectors: {}
    }
}, {
    fixture: `
        path {
            fill: #000;
            stroke: #fff;
        }
    `,
    expected: {
        root: {},
        selectors: {
            path: {
                fill: '#000',
                stroke: '#fff'
            }
        }
    }
}, {
    fixture: `
        path {
            fill: #000;
            stroke: #fff;
        }
        fill: #fff;
        stroke: #000;
    `,
    expected: {
        root: {
            fill: '#fff',
            stroke: '#000'
        },
        selectors: {
            path: {
                fill: '#000',
                stroke: '#fff'
            }
        }
    }
}, {
    fixture: `
        param: value;
        rule1 {
            param1: value1;
            rule2 {
                param2: value2;
            }
        }
    `,
    expected: {
        root: {
            param: 'value'
        },
        selectors: {
            rule1: {
                param1: 'value1'
            }
        }
    }
}];

test('ast2data', t => {
    tests.forEach(item => {
        var ast = postcss.parse(item.fixture);
        let result = ast2data(ast);
        t.same(result, item.expected);
    });

    t.end();
});
