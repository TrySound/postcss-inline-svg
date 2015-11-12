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

module.exports = function (path, data, opts) {
    return readFile(path, 'utf-8').then(function (result) {
        var transformed;
        result = applyData(result, data);

        if (typeof opts.transform === 'function') {
            transformed = opts.transform(result, path, opts);
        }

        result = transformed || transformDefault(result, opts.encode);

        return result;
    });
};
