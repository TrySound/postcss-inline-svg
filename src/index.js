import assign from 'object-assign';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import { transform, encode } from './defaults.js';
import parseLoad from './parseLoad.js';
import parseAtLoad from './parseAtLoad.js';
import load from './load.js';

function grabAtLoaders(result, atrule) {
    let parsedAtLoad;
    try {
        parsedAtLoad = parseAtLoad(atrule);
    } catch (e) {
        atrule.warn(result, e.message);
        return [];
    }
    parsedAtLoad.node = atrule;
    return [parsedAtLoad];
}

function grabLoaders(result, decl) {
    const items = [];
    decl.value.walk(node => {
        if (node.type !== 'function' || node.value !== 'svg-load') {
            return;
        }
        let parsedLoad;
        try {
            parsedLoad = parseLoad(node);
        } catch (e) {
            decl.warn(result, e.message);
            return;
        }
        parsedLoad.node = decl;
        parsedLoad.valueNode = node;
        items.push(parsedLoad);
    });
    return items;
}

function grabInliners(result, decl) {
    const items = [];
    decl.value.walk(node => {
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
            valueNode: node
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

export default postcss.plugin('postcss-inline-svg', opts => (css, result) => {
    opts = assign({
        encode,
        transform
    }, opts);

    const loaders = [];
    const atLoaders = [];
    const inliners = [];

    css.walk(node => {
        if (node.type === 'atrule') {
            if (node.name === 'svg-load') {
                atLoaders.push(...grabAtLoaders(result, node));
            }
        } else if (node.type === 'decl') {
            if (node.value.indexOf('svg-load(') !== -1 ||
                node.value.indexOf('svg-inline(') !== -1
            ) {
                node.value = valueParser(node.value);
                loaders.push(...grabLoaders(result, node));
                inliners.push(...grabInliners(result, node));
            }
        }
    });

    const promises = [].concat(loaders, atLoaders).map(item => load(item, opts));

    return Promise.all(promises).then(() => {
        finaliseLoaders(result, loaders);
        finaliseInliners(result, atLoaders, inliners);
    });
});
