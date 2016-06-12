const postcss = require('postcss');
const valueParser = require('postcss-value-parser');
const resolve = require('./lib/resolve');
const loadSVG = require('./lib/load-svg');
const ast2data = require('./lib/ast2data');
const nodes2data = require('./lib/nodes2data');

function defineLoad(result, atrule, svgs, opts) {
    atrule.remove();

    const data = ast2data(atrule);
    const params = valueParser(atrule.params).nodes;
    if (!data ||
        params.length !== 3 ||
        params[0].type !== 'word' ||
        params[1].type !== 'space' ||
        params[2].type !== 'function' ||
        params[2].value !== 'url' ||
        params[2].nodes.length === 0
    ) {
        atrule.warn(result, 'Invalid @svg-load definition');
        return Promise.resolve();
    }

    const name = params[0].value;
    const file = resolve(atrule, params[2].nodes[0].value, opts);
    return loadSVG(file, data, opts).then(svg => {
        if (svg) {
            svgs[name] = svg;
        } else {
            atrule.warn(result, `Invalid svg in '${file}'`);
            return;
        }
    });
}

function insertLoad(result, decl, opts) {
    const promises = [];
    decl.value.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-load') {
            return;
        }
        if (!node.nodes.length) {
            decl.warn(result, `Invalid "svg-load()" definition`);
            return;
        }
        let url;
        let params = {};
        let i = 0;
        const max = node.nodes.length;
        let item;
        if (node.nodes[0].type === 'string') {
            url = node.nodes[0].value;
            i += 1;
        } else {
            while (i < max) {
                item = node.nodes[i];
                if (item.type === 'div' && item.value === ',') {
                    break;
                }
                i += 1;
            }
            url = valueParser.stringify(node.nodes.slice(0, i));
        }
        const file = resolve(decl, url, opts);
        if (node.nodes[i]) {
            try {
                params = nodes2data(node.nodes.slice(i + 1));
            } catch (e) {
                decl.warn(result, e.message);
                return;
            }
        }
        node.value = 'url';
        node.nodes = [{
            type: 'word'
        }];
        const promise = loadSVG(file, {
            root: params
        }, opts).then(svg => {
            node.nodes[0].value = svg;
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
            decl.warn(result, `'${node.value}' function should not be empty`);
            return;
        }

        const name = node.nodes[0].value;
        if (!svgs[name]) {
            decl.warn(result, `'${name}' svg is not defined`);
            return;
        }

        node.value = 'url';
        node.nodes = [{
            type: 'word',
            value: svgs[name]
        }];
    });
}

const postcssInlineSvg = (opts = {}) => (css, result) => {
    const promises = [];
    const decls = [];
    const svgs = {};

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
};

module.exports = postcss.plugin('postcss-inline-svg', postcssInlineSvg);
