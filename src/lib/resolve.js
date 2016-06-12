var path = require('path');

module.exports = function (node, url, opts) {
    var relative = node.source && node.source.input && node.source.input.file;
    var root;
    if (!opts.path && relative) {
        root = path.dirname(relative);
    } else {
        root = opts.path || '.';
    }
    return path.resolve(root, url);
};
