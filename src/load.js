import { dirname, resolve } from 'path';
import readCache from 'read-cache';
import assign from 'object-assign';
import { parseDOM } from 'htmlparser2';
import { selectAll, selectOne } from 'css-select';
import serialize from 'dom-serializer';

function applyData(dom, params = {}, selectors = {}) {
    const svg = selectOne('svg', dom);

    assign(svg.attribs, params);

    Object.keys(selectors).forEach(selector => {
        const attribs = selectors[selector];
        const elements = selectAll(selector, svg);

        elements.forEach(element => {
            assign(element.attribs, attribs);
        });
    });

    return dom;
}

function removeFill(dom) {
    selectAll('[fill]', dom).forEach(element => {
        delete element.attribs.fill;
    });
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
        const dom = parseDOM(data, { xmlMode: true });

        if (opts.removeFill instanceof RegExp ? opts.removeFill.test(id) : opts.removeFill) {
            removeFill(dom);
        }

        applyData(dom, item.params, item.selectors);

        let code = serialize(dom);

        if (opts.encode) {
            code = opts.encode(code);
        }

        item.svg = opts.transform(code, id);
    }).catch(err => {
        item.error = err.message;
    });
}
