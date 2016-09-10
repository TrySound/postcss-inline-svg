import buble from 'rollup-plugin-buble';

var pkg = require('./package.json');

export default {
    entry: 'src/index.js',
    plugins: [buble()],
    external: Object.keys(pkg.dependencies).concat(['path', 'fs']),
    format: 'cjs',
    sourceMap: true,
    dest: pkg.main
};
