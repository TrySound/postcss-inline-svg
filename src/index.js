import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import parseLoad from './parseLoad.js';
import parseAtLoad from './parseAtLoad.js';
import resolveId from './resolveId.js';
import load from './load.js';

function grabAtLoaders(result, atrule, opts) {
    try {
        const file = atrule.source && atrule.source.input && atrule.source.input.file;
        const { name, url, params, selectors } = parseAtLoad(atrule);
        return [{
            id: resolveId(file, url, opts),
            name,
            params,
            selectors,
            node: atrule
        }];
    } catch (e) {
        atrule.warn(result, e.message);
    }
    return [];
}

function grabLoaders(result, decl, parsedValue, opts) {
    const items = [];
    parsedValue.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-load') {
            return;
        }
        try {
            const file = decl.source && decl.source.input && decl.source.input.file;
            const { url, params } = parseLoad(node);
            items.push({
                id: resolveId(file, url, opts),
                params,
                node: decl,
                valueNode: node,
                parsedValue
            });
        } catch (e) {
            decl.warn(result, e.message);
        }
    });
    return items;
}

function grabInliners(result, decl, parsedValue) {
    const items = [];
    parsedValue.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-inline') {
            return;
        }
        if (!node.nodes.length) {
            decl.warn(result, `Invalid "svg-inline()" statement`);
            return;
        }

        items.push({
            name: node.nodes[0].value,
            node: decl,
            valueNode: node,
            parsedValue
        });
    });
    return items;
}

function finaliseLoaders(result, loaders) {
    loaders.forEach(loader => {
        if (loader.error) {
            loader.node.warn(result, loader.error);
        } else {
            loader.valueNode.value = 'url';
            loader.valueNode.nodes = [{
                type: 'word',
                value: loader.svg
            }];
        }
    });
}

function finaliseInliners(result, atLoaders, inliners) {
    const svgs = {};
    atLoaders.forEach(loader => {
        svgs[loader.name] = loader;
        if (loader.error) {
            loader.node.warn(result, loader.error);
        } else {
            loader.node.remove();
        }
    });
    inliners.forEach(inliner => {
        const loader = svgs[inliner.name];
        if (loader && loader.svg) {
            inliner.valueNode.value = 'url';
            inliner.valueNode.nodes = [{
                type: 'word',
                value: loader.svg
            }];
        } else {
            inliner.node.warn(result, `"${inliner.name}" svg is not defined`);
        }
    });
}

function finaliseDecls(items) {
    items.forEach(item => {
        item.node.value = String(item.parsedValue);
    });
}

export default postcss.plugin('postcss-inline-svg', (opts = {}) => (css, result) => {
    const loaders = [];
    const atLoaders = [];
    const inliners = [];

    css.walk(node => {
        if (node.type === 'atrule') {
            if (node.name === 'svg-load') {
                atLoaders.push(...grabAtLoaders(result, node, opts));
            }
        } else if (node.type === 'decl') {
            if (node.value.indexOf('svg-load(') !== -1 ||
                node.value.indexOf('svg-inline(') !== -1
            ) {
                const parsedValue = valueParser(node.value);
                loaders.push(...grabLoaders(result, node, parsedValue, opts));
                inliners.push(...grabInliners(result, node, parsedValue, opts));
            }
        }
    });

    const promises = [].concat(loaders, atLoaders).map(item => {
        return load(item.id, item, opts).then(code => {
            item.svg = code;
        }).catch(err => {
            item.error = err.message;
        });
    });

    return Promise.all(promises).then(() => {
        finaliseLoaders(result, loaders);
        finaliseInliners(result, atLoaders, inliners);
        finaliseDecls([].concat(loaders, inliners));
    });
});
