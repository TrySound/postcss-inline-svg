import buble from 'rollup-plugin-buble';

var pkg = require('./package.json');

export default {
    entry: 'src/index.js',
    plugins: [buble()],
    external: Object.keys(pkg.dependencies).concat('path'),
    format: 'cjs',
    dest: pkg.main
};
