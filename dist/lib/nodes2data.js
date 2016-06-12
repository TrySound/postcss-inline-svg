var stringify = require('postcss-value-parser').stringify;

module.exports = function (nodes) {
    var data = {};
    var args = [];
    var last = '';
    var sep;

    nodes.forEach(function (node) {
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
            throw Error('Invalid svg-load() definition');
        }
    });

    args.push(last);

    args.forEach(function (arg) {
        if (!arg) {
            throw Error('Unexpected comma');
        }

        if (!sep) {
            if (arg.indexOf(':') !== -1) {
                sep = ':';
            } else if (arg.indexOf('=') !== -1) {
                sep = '=';
            } else {
                throw Error('Expected \':\' or \'=\' separator in "' +
                    arg + '"');
            }
        }

        var pair = arg.split(sep);

        if (pair.length === 1) {
            throw Error('Expected "' + sep + '" separator in "' + arg + '"');
        }

        if (pair.length !== 2) {
            throw Error('Unexpected separator in "' + arg + '"');
        }

        data[pair[0].trim()] = pair[1].trim();
    });

    return data;
};
