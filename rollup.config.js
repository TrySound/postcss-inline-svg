import babel from 'rollup-plugin-babel';

const pkg = require('./package.json');

export default {
    entry: 'src/index.js',
    plugins: [
        babel()
    ],
    external: Object.keys(pkg.dependencies).concat(['path', 'fs']),
    format: 'cjs',
    dest: pkg.main
};
