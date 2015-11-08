var pify = require('pify');
var readFile = pify(require('fs').readFile);
var applyData = require('./apply-data');

module.exports = function (url, data) {
    return readFile(url, 'utf-8').then(function (result) {
        result = applyData(result, data);
        result = result.replace(/\r?\n/g, ' ');
        result = 'data:image/svg+xml;charset=utf-8,' + result;
        return result;
    });
};
