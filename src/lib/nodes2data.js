const { stringify } = require('postcss-value-parser');

module.exports = function nodes2data(nodes) {
    const data = {};
    const args = [];
    let last = '';
    let sep;

    nodes.forEach(node => {
        if (node.type === 'div') {
            if (node.value === ',') {
                args.push(last);
                last = '';
            } else if (node.value === ':') {
                last += stringify(node);
            }
        } else if (node.type === 'word' || node.type === 'string') {
            last += node.value;
        } else if (node.type === 'space') {
            last += ' ';
        } else {
            throw Error('Invalid "svg-load()" definition');
        }
    });

    args.push(last);

    args.forEach(arg => {
        if (!arg) {
            throw Error('Invalid "svg-load()" definition');
        }

        if (!sep) {
            if (arg.indexOf(':') !== -1) {
                sep = ':';
            } else if (arg.indexOf('=') !== -1) {
                sep = '=';
            } else {
                throw Error(`Expected ":" or "=" separator in "${arg}"`);
            }
        }

        const pair = arg.split(sep);

        if (pair.length === 1) {
            throw Error(`Expected "${sep}" separator in "${arg}"`);
        }

        if (pair.length !== 2) {
            throw Error(`Expected ":" or "=" separator in "${arg}"`);
        }

        data[pair[0].trim()] = pair[1].trim();
    });

    return data;
};
