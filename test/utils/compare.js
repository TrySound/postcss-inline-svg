const assert = require('assert');
const postcss = require('postcss');
const plugin = require('../../');

module.exports = function compare(fixture, expected, options = { encode: false }, warnings = []) {
    if (Array.isArray(options)) {
        warnings = options;
        options = { encode: false };
    }
    return postcss([
        plugin(options)
    ]).process(fixture, options).then(result => {
        const resultWarnings = result.warnings();
        resultWarnings.forEach((warning, index) => {
            assert.equal(warnings[index], warning.text);
        });
        assert.equal(resultWarnings.length, warnings.length);
        assert.equal(result.css, expected);
    });
};
