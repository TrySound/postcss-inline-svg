const assign = require('object-assign');
const { parseDOM: parse } = require('htmlparser2');
const { selectAll, selectOne } = require('css-select');
const serialize = require('dom-serializer');

module.exports = function applyData(source, data) {
    const dom = parse(source, { xmlMode: true });
    const svg = dom ? selectOne('svg', dom) : null;

    if (!svg) {
        throw Error('Invalid loaded xml format');
    }

    data = data || {};
    const root = data.root || {};
    const selectors = data.selectors || {};

    assign(svg.attribs, root);

    Object.keys(selectors).forEach(selector => {
        const attribs = selectors[selector];
        const elements = selectAll(selector, svg);

        elements.forEach(element => {
            assign(element.attribs, attribs);
        });
    });

    return serialize(dom);
};
