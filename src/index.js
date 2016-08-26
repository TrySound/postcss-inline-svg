import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import parseLoad from './parseLoad.js';
import parseAtLoad from './parseAtLoad.js';
import resolveId from './resolveId.js';
import load from './load.js';

function grabAtLoaders(atrule, opts) {
    const file = atrule.source && atrule.source.input && atrule.source.input.file;
    const { name, url, params, selectors } = parseAtLoad(atrule);
    return [{
        id: resolveId(file, url, opts),
        name,
        params,
        selectors,
        node: atrule
    }];
}

function grabLoaders(decl, parsedValue, opts) {
    const file = decl.source && decl.source.input && decl.source.input.file;
    const items = [];
    parsedValue.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-load') {
            return;
        }
        const { url, params } = parseLoad(node);
        items.push({
            id: resolveId(file, url, opts),
            params,
            node: decl,
            valueNode: node,
            parsedValue
        });
    });
    return items;
}

function grabInliners(decl, parsedValue) {
    const items = [];
    parsedValue.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-inline') {
            return;
        }
        if (!node.nodes.length) {
            throw Error(`Invalid "svg-inline()" statement`);
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
                try {
                    atLoaders.push(...grabAtLoaders(node, opts));
                } catch (e) {
                    node.warn(result, e.message);
                }
            }
        } else if (node.type === 'decl') {
            if (node.value.indexOf('svg-load(') !== -1 ||
                node.value.indexOf('svg-inline(') !== -1
            ) {
                const parsedValue = valueParser(node.value);
                try {
                    loaders.push(...grabLoaders(node, parsedValue, opts));
                    inliners.push(...grabInliners(node, parsedValue, opts));
                } catch (e) {
                    node.warn(result, e.message);
                }
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
