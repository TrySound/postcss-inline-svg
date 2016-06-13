import { dirname, resolve } from 'path';
import readCache from 'read-cache';
import assign from 'object-assign';
import { parseDOM } from 'htmlparser2';
import { selectAll, selectOne } from 'css-select';
import serialize from 'dom-serializer';

function applyData(source, params = {}, selectors = {}) {
    const dom = parseDOM(source, { xmlMode: true });
    const svg = dom ? selectOne('svg', dom) : null;

    if (!svg) {
        throw Error('Invalid loaded xml format');
    }

    assign(svg.attribs, params);

    Object.keys(selectors).forEach(selector => {
        const attribs = selectors[selector];
        const elements = selectAll(selector, svg);

        elements.forEach(element => {
            assign(element.attribs, attribs);
        });
    });

    return serialize(dom);
}

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
        let code = applyData(data, item.params, item.selectors);
        if (opts.encode) {
            code = opts.encode(code);
        }
        return {
            id: item.name || item.url,
            code: opts.transform(code, id)
        };
    });
}
