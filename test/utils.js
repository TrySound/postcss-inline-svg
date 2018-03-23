const postcss = require("postcss");
const plugin = require("../");

function compare(
  fixture,
  expected,
  options = { encode: false },
  warnings = []
) {
  if (Array.isArray(options)) {
    warnings = options;
    options = { encode: false };
  }
  return postcss([plugin(options)])
    .process(fixture, options)
    .then(result => {
      const resultWarnings = result.warnings();
      resultWarnings.forEach((warning, index) => {
        expect(warnings[index]).toEqual(warning.text);
      });
      expect(resultWarnings.length).toEqual(warnings.length);
      expect(result.css).toEqual(expected);
      return result;
    });
}

exports.compare = compare;
