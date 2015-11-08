var pify = require('pify');
var readFile = pify(require('fs').readFile);
var applyData = require('./apply-data');

module.exports = function (path, data) {
    return readFile(path, 'utf-8').then(function (result) {
        result = applyData(result, data);
        result = result.trim().replace(/\r?\n/g, ' ');
        result = 'data:image/svg+xml;charset=utf-8,' + result;
        return result;
    });
};
