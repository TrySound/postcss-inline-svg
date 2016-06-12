module.exports = function (ast) {
    var root = {};
    var selectors = {};

    ast.each(function (node) {
        var selector;
        if (node.type === 'decl') {
            root[node.prop] = node.value;
        } else if (node.type === 'rule') {
            selector = selectors[node.selectors] = {};
            node.each(function (child) {
                if (child.type === 'decl') {
                    selector[child.prop] = child.value;
                }
            });
        }
    });

    return {
        root: root,
        selectors: selectors
    };
};
