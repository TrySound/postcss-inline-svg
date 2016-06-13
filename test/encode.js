import test from 'ava';
import { readFileSync as readFile } from 'fs';
import encode from '../dist/lib/encode';

const files = [
    'border.svg'
];

// Should be move into own module

files.forEach(file => {
    test(`should decode: ${file}`, t => {
        const svg = encode(readFile(`svg/encode/${file}`, 'utf-8'));
        t.notThrows(() => {
            decodeURIComponent(svg);
        });
    });
});
