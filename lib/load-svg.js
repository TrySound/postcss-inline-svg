var pify = require('pify');
var readFile = pify(require('fs').readFile);
var applyData = require('./apply-data');

function transformDefault(result, encode) {
    // Normalize
    result = result
            .replace(/"/g, '\'')
            .replace(/\s+/g, ' ')
            .trim();

    // Encode
    if (encode !== false) {
        result = result
            .replace(/</g, '%3C')
            .replace(/>/g, '%3E')
            .replace(/&/g, '%26')
            .replace(/#/g, '%23');
    }

    return '"data:image/svg+xml;charset=utf-8,' + result + '"';
}

module.exports = function (opts) {
    var cache = {};
    return function (path, data) {
        return Promise.resolve().then(function () {
            return cache[path] || readFile(path, 'utf-8');
        }).then(function (result) {
            var transformed;
            cache[path] = result;
            result = applyData(result, data);

            if (typeof opts.transform === 'function') {
                transformed = opts.transform(result, path, opts);
            } else {
                transformed = transformDefault(result, opts.encode);
            }

            return transformed;
        });
    };
};
