var path = require('path');
var postcss = require('postcss');
var valueParser = require('postcss-value-parser');
var loadSVG = require('./lib/load-svg');
var ast2data = require('./lib/ast2data');

function resolvePath(opts, node, url) {
    var root;
    if (!opts.path) {
        if (node.source && node.source.input) {
            root = path.dirname(node.source.input.file);
        } else {
            root = process.cwd();
        }
    } else {
        root = path.resolve(process.cwd(), opts.path);
    }
    return path.resolve(root, url);
}

function defineLoad(result, promises, svgs, atrule, opts) {
    atrule.remove();

    var data = ast2data(atrule);
    var params = valueParser(atrule.params).nodes;
    if (!data ||
        params.length !== 3 ||
        params[0].type !== 'word' ||
        params[1].type !== 'space' ||
        params[2].type !== 'function' ||
        params[2].value !== 'url' ||
        params[2].nodes.length === 0
    ) {
        return atrule.warn(result, 'Invalid @svg-load definition');
    }

    var name = params[0].value;
    var url = resolvePath(opts, atrule, params[2].nodes[0].value);
    var promise = loadSVG(url, data, opts).then(function (svg) {
        if (svg) {
            svgs[name] = svg;
        } else {
            return atrule.warn(result, 'Invalid svg in `' + url + '`');
        }
    });

    promises.push(promise);
}

function insertLoad(result, promises, decl, opts) {
    decl.value.walk(function (node) {
        if (node.type !== 'function' || node.value !== 'svg-load') {
            return;
        }
        if (!node.nodes.length) {
            decl.warn(result, [
                '`',
                node.value,
                '` function should not be empty'
            ].join(''));
            return;
        }
        var url;
        var params = {};
        var i = 0;
        var max = node.nodes.length;
        var item;
        if (node.nodes[0].type === 'string') {
            url = node.nodes[0].value;
            i += 1;
        } else {
            while (i < max) {
                item = node.nodes[i];
                if (item.type === 'div' && item.value === ',') {
                    break;
                }
                i += 1;
            }
            url = valueParser.stringify(node.nodes.slice(0, i));
        }
        url = resolvePath(opts, decl, url);
        while (i < max) {
            if (i + 3 >= max ||
                node.nodes[i].type !== 'div' ||
                node.nodes[i].value !== ',' ||
                node.nodes[i + 1].type !== 'word' ||
                node.nodes[i + 2].type !== 'div' ||
                node.nodes[i + 2].value !== ':' ||
                node.nodes[i + 3].type !== 'word'
            ) {
                decl.warn(result, 'Invalid svg-load() definition');
                return;
            }
            params[node.nodes[i + 1].value] = node.nodes[i + 3].value;
            i += 4;
        }
        node.value = 'url';
        node.nodes = [{
            type: 'word'
        }];
        var promise = loadSVG(url, {
            root: params
        }, opts).then(function (svg) {
            node.nodes[0].value = svg;
        });
        promises.push(promise);
    });
}

function insertInline(result, svgs, decl) {
    decl.value.walk(function (node) {
        if (node.type !== 'function' || node.value !== 'svg-inline') {
            return;
        }
        if (!node.nodes.length) {
            decl.warn(result, [
                '`',
                node.value,
                '` function should not be empty'
            ].join(''));
            return;
        }

        var name = node.nodes[0].value;
        if (!svgs[name]) {
            decl.warn(result, '`' + name + '` svg is not defined');
            return;
        }

        node.value = 'url';
        node.nodes = [{
            type: 'word',
            value: svgs[name]
        }];
    });
}

module.exports = postcss.plugin('postcss-inline-svg', function (opts) {
    opts = opts || {};

    return function (css, result) {
        var promises = [];
        var svgs = {};
        var decls = [];

        css.walk(function (node) {
            if (node.type === 'atrule') {
                if (node.name === 'svg-load') {
                    defineLoad(result, promises, svgs, node, opts);
                }
            } else if (node.type === 'decl') {
                if (~node.value.indexOf('svg-load(') ||
                    ~node.value.indexOf('svg-inline(')
                ) {
                    node.value = valueParser(node.value);
                    insertLoad(result, promises, node, opts);
                    decls.push(node);
                }
            }
        });

        return Promise.all(promises).then(function () {
            decls.forEach(function (decl) {
                insertInline(result, svgs, decl, opts);
                decl.value = decl.value.toString();
            });
        });
    };
});
