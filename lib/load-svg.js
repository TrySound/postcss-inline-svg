var pify = require('pify');
var readFile = pify(require('fs').readFile);
var applyData = require('./apply-data');

module.exports = function (path, data, encode) {
    return readFile(path, 'utf-8').then(function (result) {
        // Normalize
        result = applyData(result, data)
                .replace(/"/g, '\'')
                .replace(/\s+/g, ' ')
                .trim();

        // Encode
        if (encode) {
            result = result
                .replace(/</g, '%3C')
                .replace(/>/g, '%3E')
                .replace(/&/g, '%26')
                .replace(/#/g, '%23');
        }

        return 'data:image/svg+xml;charset=utf-8,' + result;
    });
};
