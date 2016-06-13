import { dirname, resolve } from 'path';
import readCache from 'read-cache';
import applyData from './lib/apply-data';

function resolveId(node, url, path) {
    const file = node.source && node.source.input && node.source.input.file;
    let base;
    if (!path && file) {
        base = dirname(file);
    } else {
        base = path || '.';
    }
    return resolve(base, url);
}

export default function load(item, opts) {
    const id = resolveId(item.node, item.url, opts.path);
    return readCache(id, 'utf-8').then(data => {
        let code = applyData(data, {
            root: item.params,
            selectors: item.selectors
        });
        if (opts.encode) {
            code = opts.encode(code);
        }
        return {
            id: item.name || item.url,
            code: opts.transform(code, id)
        };
    });
}
