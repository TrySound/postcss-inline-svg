'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var postcss = _interopDefault(require('postcss'));
var valueParser = require('postcss-value-parser');
var valueParser__default = _interopDefault(valueParser);
var path = require('path');
var fs = require('fs');
var htmlparser2 = require('htmlparser2');
var serialize = _interopDefault(require('dom-serializer'));
var cssSelect = require('css-select');

function parseRuleDefinition(params) {
    var ref = valueParser__default(params);
    var nodes = ref.nodes;
    if (nodes.length !== 3 ||
        nodes[0].type !== 'word' ||
        nodes[1].type !== 'space' ||
        nodes[2].type !== 'function' ||
        nodes[2].value !== 'url' ||
        nodes[2].nodes.length === 0
    ) {
        throw Error('Invalid "@svg-load" definition');
    }
    return {
        name: nodes[0].value,
        url: nodes[2].nodes[0].value
    };
}

function getRuleParams(rule) {
    var params = {};
    var selectors = {};

    rule.each(function (node) {
        if (node.type === 'decl') {
            params[node.prop] = node.value;
        } else if (node.type === 'rule') {
            var selector = selectors[node.selectors] || {};
            node.each(function (child) {
                if (child.type === 'decl') {
                    selector[child.prop] = child.value;
                }
            });
            selectors[node.selectors] = selector;
        }
    });

    return {
        params: params,
        selectors: selectors
    };
}

var invalidDeclLoad = "Invalid \"svg-load()\" definition";

function getUrl(nodes) {
    var url = '';
    var urlEnd = 0;

    for (var i = 0; i < nodes.length; i += 1) {
        var node = nodes[i];
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
        url += valueParser.stringify(node);
        urlEnd += 1;
    }

    return {
        url: url,
        urlEnd: urlEnd
    };
}

function getParamChunks(nodes) {
    var list = [];
    var lastArg = nodes.reduce(function (arg, node) {
        if (node.type === 'word' || node.type === 'string') {
            return arg + node.value;
        }
        if (node.type === 'space') {
            return arg + ' ';
        }
        if (node.type === 'div' && node.value === ',') {
            list.push(arg);
            return '';
        }
        return arg + valueParser.stringify(node);
    }, '');

    return list.concat(lastArg);
}

function splitParams(list) {
    var params = {};

    list.reduce(function (sep, arg) {
        if (!arg) {
            throw Error(invalidDeclLoad);
        }

        if (!sep) {
            if (arg.indexOf(':') !== -1) {
                sep = ':';
            } else if (arg.indexOf('=') !== -1) {
                sep = '=';
            } else {
                throw Error(("Expected \":\" or \"=\" separator in \"" + arg + "\""));
            }
        }

        var pair = arg.split(sep);
        if (pair.length !== 2) {
            throw Error(("Expected \"" + sep + "\" separator in \"" + arg + "\""));
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
    var ref = getUrl(valueNode.nodes);
    var url = ref.url;
    var urlEnd = ref.urlEnd;

    // parse params
    var paramsNodes = valueNode.nodes.slice(urlEnd + 1);
    var params = urlEnd !== valueNode.nodes.length ? splitParams(getParamChunks(paramsNodes)) : {};

    return {
        url: url,
        params: params,
        valueNode: valueNode,
        parsedValue: parsedValue
    };
}

function getInliner(parsedValue, valueNode) {
    if (!valueNode.nodes.length) {
        throw Error("Invalid \"svg-inline()\" statement");
    }
    var name = valueNode.nodes[0].value;

    return {
        name: name,
        valueNode: valueNode,
        parsedValue: parsedValue
    };
}

function parseDeclValue(value) {
    var loaders = [];
    var inliners = [];
    var parsedValue = valueParser__default(value);

    parsedValue.walk(function (valueNode) {
        if (valueNode.type === 'function') {
            if (valueNode.value === 'svg-load') {
                loaders.push(getLoader(parsedValue, valueNode));
            } else if (valueNode.value === 'svg-inline') {
                inliners.push(getInliner(parsedValue, valueNode));
            }
        }
    });

    return {
        loaders: loaders,
        inliners: inliners
    };
}

function resolveId(file, url, opts) {
    if (opts.path) {
        return path.resolve(opts.path, url);
    }
    if (file) {
        return path.resolve(path.dirname(file), url);
    }
    return path.resolve(url);
}

function render(code) {
    var processors = [], len = arguments.length - 1;
    while ( len-- > 0 ) processors[ len ] = arguments[ len + 1 ];

    var dom = htmlparser2.parseDOM(code, { xmlMode: true });

    processors.forEach(function (processor) { return processor(dom); });

    return serialize(dom);
}

function encode(code) {
    return code
        .replace(/%/g, '%25')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/&/g, '%26')
        .replace(/#/g, '%23');
}

function normalize(code) {
    return code
        .replace(/'/g, '%22')
        .replace(/"/g, '\'')
        .replace(/\s+/g, ' ')
        .trim();
}

function transform(code) {
    return ("\"data:image/svg+xml;charset=utf-8," + (normalize(code)) + "\"");
}

function matchId(exp, id) {
    return exp instanceof RegExp ? exp.test(id) : Boolean(exp);
}

function removeFillAttrib(element) {
    delete element.attribs.fill;
}

function removeFill(id, opts) {
    return function (dom) {
        if (matchId(opts.removeFill, id)) {
            cssSelect.selectAll('[fill]', dom).forEach(removeFillAttrib);
        }
    };
}

function applyParams(params) {
    return function (ref) {
        var attribs = ref.attribs;

        Object.keys(params).forEach(function (name) {
            attribs[name] = params[name];
        });
    };
}

function applyRootParams(params) {
    return function (dom) {
        applyParams(params)(cssSelect.selectOne('svg', dom));
    };
}

function applySelectedParams(selectors) {
    return function (dom) {
        var svg = cssSelect.selectOne('svg', dom);

        Object.keys(selectors).forEach(function (selector) {
            cssSelect.selectAll(selector, svg).forEach(applyParams(selectors[selector]));
        });
    };
}

function read(id) {
    return new Promise(function (resolve, reject) {
        fs.readFile(id, 'utf-8', function (err, data) {
            if (err) {
                reject(Error(("Can't load '" + id + "'")));
            } else {
                resolve(data);
            }
        });
    });
}

function load(id, params, selectors, opts) {
    var processors = [
        removeFill(id, opts),
        applyRootParams(params),
        applySelectedParams(selectors)
    ];
    return read(id).then(function (data) {
        var code = render.apply(void 0, [ data ].concat( processors ));

        if (opts.base64) {
            var converted = new Buffer(code);
            code = "\"data:image/svg+xml;base64," + converted.toString('base64') + "\"";
        } else {
            if (opts.encode !== false) {
                code = (opts.encode || encode)(code);
            }

            if (opts.transform !== false) {
                code = (opts.transform || transform)(code, id);
            }
        }

        return code;
    });
}

function removeLoader(loader) {
    if (!loader.error && loader.node.type === 'atrule') {
        loader.node.remove();
    }
}

function applyInliner(inliner) {
    if (!inliner.loader.error) {
        inliner.valueNode.value = 'url';
        inliner.valueNode.nodes = [{
            type: 'word',
            value: inliner.loader.svg
        }];
    }
}

function stringifyInliner(inliner) {
    if (!inliner.loader.error) {
        inliner.node.value = String(inliner.parsedValue);
    }
}

var index = postcss.plugin('postcss-inline-svg', function (opts) {
    if ( opts === void 0 ) opts = {};

    return function (css, result) {
    var loadersMap = {};
    var loaders = [];
    var inliners = [];

    css.walk(function (node) {
        if (node.type === 'atrule') {
            if (node.name === 'svg-load') {
                try {
                    var file = node.source && node.source.input && node.source.input.file;
                    var ref = parseRuleDefinition(node.params);
                    var name = ref.name;
                    var url = ref.url;
                    var ref$1 = getRuleParams(node);
                    var params = ref$1.params;
                    var selectors = ref$1.selectors;
                    var loader = {
                        id: resolveId(file, url, opts),
                        parent: file,
                        params: params,
                        selectors: selectors,
                        node: node
                    };
                    loaders.push(loader);
                    loadersMap[name] = loader;
                } catch (e) {
                    node.warn(result, e.message);
                }
            }
        } else if (node.type === 'decl') {
            if (node.value.indexOf('svg-load(') !== -1 ||
                node.value.indexOf('svg-inline(') !== -1
            ) {
                try {
                    var file$1 = node.source && node.source.input && node.source.input.file;
                    var statements = parseDeclValue(node.value);
                    statements.loaders.forEach(function (ref) {
                        var url = ref.url;
                        var params = ref.params;
                        var valueNode = ref.valueNode;
                        var parsedValue = ref.parsedValue;

                        var loader = {
                            id: resolveId(file$1, url, opts),
                            parent: file$1,
                            params: params,
                            selectors: {},
                            node: node
                        };
                        loaders.push(loader);
                        inliners.push({
                            loader: loader,
                            node: node,
                            valueNode: valueNode,
                            parsedValue: parsedValue
                        });
                    });
                    statements.inliners.forEach(function (ref) {
                        var name = ref.name;
                        var valueNode = ref.valueNode;
                        var parsedValue = ref.parsedValue;

                        var loader = loadersMap[name];
                        if (loader) {
                            inliners.push({
                                loader: loader,
                                node: node,
                                valueNode: valueNode,
                                parsedValue: parsedValue
                            });
                        } else {
                            node.warn(result, ("\"" + name + "\" svg is not defined"));
                        }
                    });
                } catch (e) {
                    node.warn(result, e.message);
                }
            }
        }
    });

    var promises = loaders.map(function (loader) {
        return load(loader.id, loader.params, loader.selectors, opts).then(function (code) {
            loader.svg = code;
            result.messages.push({
                type: 'dependency',
                file: loader.id,
                parent: loader.parent
            });
        }).catch(function (err) {
            loader.error = true;
            loader.node.warn(result, err.message);
        });
    });

    return Promise.all(promises).then(function () {
        loaders.forEach(removeLoader);
        inliners.forEach(applyInliner);
        inliners.forEach(stringifyInliner);
    });
};
});

module.exports = index;
//# sourceMappingURL=postcss-inline-svg.js.map
