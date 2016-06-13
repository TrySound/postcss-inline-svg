import assign from 'object-assign';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import { transform, encode } from './defaults.js';
import parseLoad from './parseLoad.js';
import parseAtLoad from './parseAtLoad.js';
import load from './load.js';

function defineLoad(result, atrule, svgs, opts) {
    let parsedAtLoad;
    try {
        parsedAtLoad = parseAtLoad(atrule);
    } catch (e) {
        atrule.warn(result, e.message);
        return null;
    }
    parsedAtLoad.node = atrule;
    atrule.remove();
    return load(parsedAtLoad, opts).then(({ code }) => {
        svgs[parsedAtLoad.name] = code;
    }).catch(err => {
        atrule.warn(result, err.message);
    });
}

function insertLoad(result, decl, opts) {
    const promises = [];
    decl.value.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-load') {
            return;
        }
        let parsedLoad;
        try {
            parsedLoad = parseLoad(node, opts);
        } catch (e) {
            decl.warn(result, e.message);
            return;
        }
        parsedLoad.node = decl;
        parsedLoad.valueNode = node;
        const promise = load(parsedLoad, opts).then(({ code }) => {
            node.value = 'url';
            node.nodes = [{
                type: 'word',
                value: code
            }];
        }).catch(err => {
            decl.warn(result, err.message);
        });
        promises.push(promise);
    });
    return Promise.all(promises);
}

function insertInline(result, decl, svgs) {
    decl.value.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-inline') {
            return;
        }
        if (!node.nodes.length) {
            decl.warn(result, `Invalid "svg-inline()" statement`);
            return;
        }

        const name = node.nodes[0].value;
        if (!svgs[name]) {
            decl.warn(result, `"${name}" svg is not defined`);
            return;
        }

        node.value = 'url';
        node.nodes = [{
            type: 'word',
            value: svgs[name]
        }];
    });
}

export default postcss.plugin('postcss-inline-svg', opts => (css, result) => {
    const promises = [];
    const decls = [];
    const svgs = {};

    opts = assign({
        encode,
        transform
    }, opts);

    css.walk(node => {
        if (node.type === 'atrule') {
            if (node.name === 'svg-load') {
                promises.push(defineLoad(result, node, svgs, opts));
            }
        } else if (node.type === 'decl') {
            if (node.value.indexOf('svg-load(') !== -1 ||
                node.value.indexOf('svg-inline(') !== -1
            ) {
                node.value = valueParser(node.value);
                promises.push(insertLoad(result, node, opts));
                decls.push(node);
            }
        }
    });

    return Promise.all(promises).then(() => {
        decls.forEach(decl => {
            insertInline(result, decl, svgs, opts);
            decl.value = decl.value.toString();
        });
    });
});
