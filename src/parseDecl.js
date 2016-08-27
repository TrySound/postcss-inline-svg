import valueParser, { stringify } from 'postcss-value-parser';

const invalidDeclLoad = `Invalid "svg-load()" definition`;

function getUrl(nodes) {
    let url = '';
    let urlEnd = 0;

    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.type === 'string') {
            if (i !== 0) {
                throw Error(invalidDeclLoad);
            }
            url = node.value;
            urlEnd = i + 1;
            break;
        }
        if (node.type === 'div' && node.value === ',') {
            if (i === 0) {
                throw Error(invalidDeclLoad);
            }
            urlEnd = i;
            break;
        }
        url += stringify(node);
        urlEnd += 1;
    }

    return {
        url,
        urlEnd
    };
}

function getParamChunks(nodes) {
    const list = [];
    const lastArg = nodes.reduce((arg, node) => {
        if (node.type === 'div') {
            if (node.value === ',') {
                list.push(arg);
                return '';
            }
            return arg + stringify(node);
        }
        if (node.type === 'word' || node.type === 'string') {
            return arg + node.value;
        }
        if (node.type === 'space') {
            return arg + ' ';
        }
        throw Error(invalidDeclLoad);
    }, '');

    return list.concat(lastArg);
}

function splitParams(list) {
    const params = {};

    list.reduce((sep, arg) => {
        if (!arg) {
            throw Error(invalidDeclLoad);
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
        params[pair[0].trim()] = pair[1].trim();

        return sep;
    }, null);

    return params;
}

function getLoader(parsedValue, valueNode) {
    if (!valueNode.nodes.length) {
        throw Error(invalidDeclLoad);
    }

    // parse url
    const { url, urlEnd } = getUrl(valueNode.nodes);

    // parse params
    const paramsNodes = valueNode.nodes.slice(urlEnd + 1);
    const params = urlEnd !== valueNode.nodes.length ? splitParams(getParamChunks(paramsNodes)) : {};

    return {
        url,
        params,
        valueNode,
        parsedValue
    };
}

function getInliner(parsedValue, valueNode) {
    if (!valueNode.nodes.length) {
        throw Error(`Invalid "svg-inline()" statement`);
    }
    const name = valueNode.nodes[0].value;

    return {
        name,
        valueNode,
        parsedValue
    };
}

export function parseDeclValue(value) {
    const loaders = [];
    const inliners = [];
    const parsedValue = valueParser(value);

    parsedValue.walk(valueNode => {
        if (valueNode.type === 'function') {
            if (valueNode.value === 'svg-load') {
                loaders.push(getLoader(parsedValue, valueNode));
            } else if (valueNode.value === 'svg-inline') {
                inliners.push(getInliner(parsedValue, valueNode));
            }
        }
    });

    return {
        loaders,
        inliners
    };
}
