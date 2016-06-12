var readCache = require('read-cache');
var applyData = require('./apply-data');
var encodeURI = require('./encode');

function transformDefault(result, encode) {
    // Normalize
    result = result
            .replace(/"/g, '\'')
            .replace(/\s+/g, ' ')
            .trim();

    // Encode
    if (encode !== false) {
        result = encodeURI(result);
    }

    return '"data:image/svg+xml;charset=utf-8,' + result + '"';
}

module.exports = function (path, data, opts) {
    return readCache(path, 'utf-8').then(function (result) {
        var transformed;
        result = applyData(result, data);

        if (typeof opts.transform === 'function') {
            transformed = opts.transform(result, path, opts);
        } else {
            transformed = transformDefault(result, opts.encode);
        }

        return transformed;
    });
};
