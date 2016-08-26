import parseLoad from './parseLoad.js';
import parseAtLoad from './parseAtLoad.js';

export function createLoader(node, valueNode) {
    const file = node.source && node.source.input && node.source.input.file;
    let loader;

    if (node.type === 'decl') {
        loader = parseLoad(valueNode);
    }
    if (node.type === 'atrule') {
        loader = parseAtLoad(valueNode);
    }

    return {
        file,
        node,
        valueNode,
        loader
    };
}
