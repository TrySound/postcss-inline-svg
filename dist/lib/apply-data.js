var assign = require('object-assign');
var parse = require('htmlparser2').parseDOM;
var selectAll = require('css-select');
var selectOne = selectAll.selectOne;
var serialize = require('dom-serializer');

module.exports = function (source, data) {
    var dom = parse(source, { xmlMode: true });
    var svg = dom ? selectOne('svg', dom) : null;

    if (!svg) {
        throw Error('Invalid loaded xml format');
    }

    data = data || {};
    var root = data.root || {};
    var selectors = data.selectors || {};

    assign(svg.attribs, root);

    Object.keys(selectors).forEach(function (selector) {
        var attribs = selectors[selector];
        var elements = selectAll(selector, svg);

        elements.forEach(function (element) {
            assign(element.attribs, attribs);
        });
    });

    return serialize(dom);
};
