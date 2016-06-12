var postcss = require('postcss');
var valueParser = require('postcss-value-parser');
var resolve = require('./lib/resolve');
var loadSVG = require('./lib/load-svg');
var ast2data = require('./lib/ast2data');
var nodes2data = require('./lib/nodes2data');

function defineLoad(result, atrule, svgs, opts) {
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
        atrule.warn(result, 'Invalid @svg-load definition');
        return Promise.resolve();
    }

    var name = params[0].value;
    var file = resolve(atrule, params[2].nodes[0].value, opts);
    return loadSVG(file, data, opts).then(function (svg) {
        if (svg) {
            svgs[name] = svg;
        } else {
            atrule.warn(result, 'Invalid svg in `' + file + '`');
            return;
        }
    });
}

function insertLoad(result, decl, opts) {
    var promises = [];
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
        var file = resolve(decl, url, opts);
        if (node.nodes[i]) {
            try {
                params = nodes2data(node.nodes.slice(i + 1));
            } catch (e) {
                decl.warn(result, e.message);
                return;
            }
        }
        node.value = 'url';
        node.nodes = [{
            type: 'word'
        }];
        var promise = loadSVG(file, {
            root: params
        }, opts).then(function (svg) {
            node.nodes[0].value = svg;
        });
        promises.push(promise);
    });
    return Promise.all(promises);
}

function insertInline(result, decl, svgs) {
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
        var decls = [];
        var svgs = {};

        css.walk(function (node) {
            if (node.type === 'atrule') {
                if (node.name === 'svg-load') {
                    promises.push(defineLoad(result, node, svgs, opts));
                }
            } else if (node.type === 'decl') {
                if (node.value.indexOf('svg-load(') !== -1 ||
                    node.value.indexOf('svg-inline(') !== -1
                ) {
                    node.value = valueParser(node.value);
                    promises.push(insertLoad(result, node, opts));
                    decls.push(node);
                }
            }
        });

        return Promise.all(promises).then(function () {
            decls.forEach(function (decl) {
                insertInline(result, decl, svgs, opts);
                decl.value = decl.value.toString();
            });
        });
    };
});
