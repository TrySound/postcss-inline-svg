import test from 'ava';
import { readFileSync as readFile } from 'fs';
import encode from '../lib/encode';

const files = [
    'border.svg'
];

files.forEach(file => {
    test(`should decode: ${file}`, t => {
        const svg = encode(readFile(`svg/encode/${file}`, 'utf-8'));
        t.doesNotThrow(() => {
            decodeURIComponent(svg);
        });
    });
});
