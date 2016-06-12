import test from 'ava';
import valueParser from 'postcss-value-parser';
import nodes2data from '../dist/lib/nodes2data';

let tests = [{
    fixture: '',
    error: 'Unexpected comma'
}, {
    fixture: 'fill: #000',
    expected: {
        fill: '#000'
    }
}, {
    fixture: 'fill: "#000"',
    expected: {
        fill: '#000'
    }
}, {
    fixture: 'fill = "#000"',
    expected: {
        fill: '#000'
    }
}, {
    fixture: 'fill: #000, stroke: #fff',
    expected: {
        fill: '#000',
        stroke: '#fff'
    }
}, {
    fixture: 'fill: #000,',
    error: 'Unexpected comma'
}, {
    fixture: 'fill #000',
    error: 'Expected \':\' or \'=\' separator in "fill #000"'
}, {
    fixture: 'fill: #000, stroke=#fff',
    error: 'Expected ":" separator in "stroke=#fff"'
}, {
    fixture: 'fill=#000, stroke: #fff',
    error: 'Expected "=" separator in "stroke: #fff"'
}, {
    fixture: 'fill==#000',
    error: 'Unexpected separator in "fill==#000"'
}];

tests.forEach(item => {
    test(item.fixture, t => {
        let nodes = valueParser(item.fixture).nodes;
        if (item.error) {
            t.throws(function () {
                nodes2data(nodes);
            }, item.error);
        } else {
            t.deepEqual(nodes2data(nodes), item.expected);
        }
    });
});
