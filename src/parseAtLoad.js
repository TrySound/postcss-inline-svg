import valueParser from 'postcss-value-parser';

function invalid() {
    throw Error('Invalid "@svg-load" definition');
}

export default function parseAtLoad(stmt) {
    const { nodes } = valueParser(stmt.params);
    if (nodes.length !== 3 ||
        nodes[0].type !== 'word' ||
        nodes[1].type !== 'space' ||
        nodes[2].type !== 'function' ||
        nodes[2].value !== 'url' ||
        nodes[2].nodes.length === 0
    ) {
        invalid();
    }
    const name = nodes[0].value;
    const url = nodes[2].nodes[0].value;
    const params = {};
    const selectors = {};

    stmt.each(node => {
        if (node.type === 'decl') {
            params[node.prop] = node.value;
        } else if (node.type === 'rule') {
            const selector = selectors[node.selectors] || {};
            node.each(child => {
                if (child.type === 'decl') {
                    selector[child.prop] = child.value;
                }
            });
            selectors[node.selectors] = selector;
        }
    });

    return {
        name,
        url,
        params,
        selectors
    };
}
