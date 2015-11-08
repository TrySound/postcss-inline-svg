var postcss = require('postcss');
var valueParser = require('postcss-value-parser');
var loadSVG = require('./lib/load-svg');
var ast2data = require('./lib/ast2data');

function defineLoad(promises, svgs, atrule) {
    atrule.remove();

    var data = ast2data(atrule);
    var params = valueParser(atrule.params).nodes;
    if (!data ||
        params[0].type !== 'word' ||
        params[1].type !== 'space' ||
        params[2].type !== 'function' ||
        params[2].value !== 'url' ||
        params[2].nodes.length === 0
    ) {
        atrule.warn('Invalid @svg-load definition');
        return;
    }

    var name = params[0].value;
    var url = params[2].nodes[0].value;

    if (svgs[name]) {
        atrule.warn('`' + name + '` svg already defined');
    }
    var promise = loadSVG(url, data).then(function (result) {
        if (result) {
            svgs[name] = result;
        } else {
            atrule.warn('Invalid svg in `' + url + '`');
        }
    });

    promises.push(promise);
}

function insertLoad(promises, decl) {
    decl.value.walk(function (node) {
        if (node.type !== 'function' || node.value !== 'svg-load') {
            return;
        }
        if (!node.nodes.length) {
            decl.warn('`' + node.value + '` function should not be empty');
            return;
        }
        var url = valueParser.stringify(node.nodes);
        var promise = loadSVG(url).then(function (result) {
            node.value = 'url';
            node.nodes = [{
                type: 'string',
                quote: '\'',
                value: result
            }];
        });
        promises.push(promise);
    });
}

function insertInline(svgs, decl) {
    decl.value.walk(function (node) {
        if (node.type !== 'function' || node.value !== 'svg-inline') {
            return;
        }
        if (!node.nodes.length) {
            decl.warn('`' + node.value + '` function should not be empty');
            return;
        }

        var name = node.nodes[0].value;
        if (!svgs[name]) {
            decl.warn('`' + name + '` svg is not defined');
            return;
        }

        node.value = 'url';
        node.nodes = [{
            type: 'string',
            quote: '\'',
            value: svgs[name]
        }];
    });
}

module.exports = postcss.plugin('postcss-inline-svg', function (opts) {
    opts = opts || {};

    return function (css) {
        var promises = [];
        var svgs = {};
        var decls = [];

        css.walk(function (node) {
            if (node.type === 'atrule') {
                if (node.name === 'svg-load') {
                    defineLoad(promises, svgs, node);
                }
            } else if (node.type === 'decl') {
                if (~node.value.indexOf('svg-load(') ||
                    ~node.value.indexOf('svg-inline(')
                ) {
                    node.value = valueParser(node.value);
                    insertLoad(promises, node);
                    decls.push(node);
                }
            }
        });

        return Promise.all(promises).then(function () {
            decls.forEach(function (decl) {
                insertInline(svgs, decl);
                decl.value = decl.value.toString();
            });
        });
    };
});
