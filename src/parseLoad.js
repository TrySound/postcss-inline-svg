import { stringify } from 'postcss-value-parser';

function invalid() {
    throw Error(`Invalid "svg-load()" definition`);
}

function expectedIn(arg) {
    throw Error(`Expected ":" or "=" separator in "${arg}"`);
}

function expectedSepIn(sep, arg) {
    throw Error(`Expected "${sep}" separator in "${arg}"`);
}

export default function parseLoad(stmt) {
    const max = stmt.nodes.length;

    if (!max) {
        invalid();
    }

    // parse url
    let url = '';
    let urlEnd = 0;
    for (let i = 0; i < max; i += 1) {
        const node = stmt.nodes[i];
        if (node.type === 'string') {
            if (i !== 0) {
                invalid();
            }
            url = node.value;
            urlEnd = i + 1;
            break;
        }
        if (node.type === 'div' && node.value === ',') {
            if (i === 0) {
                invalid();
            }
            urlEnd = i;
            break;
        }
        url += stringify(node);
        urlEnd += 1;
    }

    // parse another args
    const args = [];
    if (urlEnd !== max) {
        let lastArg = '';
        for (let i = urlEnd + 1; i < max; i += 1) {
            const node = stmt.nodes[i];
            if (node.type === 'div') {
                if (node.value === ',') {
                    args.push(lastArg);
                    lastArg = '';
                } else {
                    lastArg += stringify(node);
                }
            } else if (node.type === 'word' || node.type === 'string') {
                lastArg += node.value;
            } else if (node.type === 'space') {
                lastArg += ' ';
            } else {
                invalid();
            }
        }
        args.push(lastArg);
    }

    // parse params in args
    let sep;
    const params = args.reduce((data, arg) => {
        if (!arg) {
            invalid();
        }

        if (!sep) {
            if (arg.indexOf(':') !== -1) {
                sep = ':';
            } else if (arg.indexOf('=') !== -1) {
                sep = '=';
            } else {
                expectedIn(arg);
            }
        }

        const pair = arg.split(sep);

        if (pair.length === 1) {
            expectedSepIn(sep, arg);
        }

        if (pair.length !== 2) {
            expectedIn(arg);
        }

        data[pair[0].trim()] = pair[1].trim();
        return data;
    }, {});

    return {
        url,
        params
    };
}
