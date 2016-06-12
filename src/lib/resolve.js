const path = require('path');

module.exports = function resolve(node, url, opts) {
    const relative = node.source && node.source.input && node.source.input.file;
    let root;
    if (!opts.path && relative) {
        root = path.dirname(relative);
    } else {
        root = opts.path || '.';
    }
    return path.resolve(root, url);
};
