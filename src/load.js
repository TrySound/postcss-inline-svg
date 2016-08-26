import { dirname, resolve } from 'path';
import readCache from 'read-cache';
import render from './render.js';
import { removeFill, applyRootParams, applySelectedParams } from './processors.js';
import { transform, encode } from './defaults.js';

function resolveId(file, url, path) {
    let base;
    if (!path && file) {
        base = dirname(file);
    } else {
        base = path || '.';
    }
    return resolve(base, url);
}

export default function load(item, opts) {
    const id = resolveId(item.file, item.url, opts.path);
    const processors = [
        removeFill(id, opts),
        applyRootParams(item.params || {}),
        applySelectedParams(item.selectors || {})
    ];
    return readCache(id, 'utf-8').then(data => {
        let code = render(data, ...processors);

        if (opts.encode !== false) {
            code = (opts.encode || encode)(code);
        }

        if (opts.transform !== false) {
            code = (opts.transform || transform)(code, id);
        }

        item.svg = code;
    }).catch(err => {
        item.error = err.message;
    });
}
