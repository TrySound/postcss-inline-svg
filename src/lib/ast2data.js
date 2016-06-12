module.exports = function ast2data(ast) {
    const root = {};
    const selectors = {};

    ast.each(node => {
        let selector;
        if (node.type === 'decl') {
            root[node.prop] = node.value;
        } else if (node.type === 'rule') {
            selector = selectors[node.selectors] = {};
            node.each(child => {
                if (child.type === 'decl') {
                    selector[child.prop] = child.value;
                }
            });
        }
    });

    return {
        root,
        selectors
    };
};
