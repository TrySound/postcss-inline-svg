import babel from "rollup-plugin-babel";

const pkg = require("./package.json");

export default {
  input: "src/index.js",
  output: {
    file: pkg.main,
    format: "cjs"
  },
  external: Object.keys(pkg.dependencies).concat(["path", "fs"]),
  plugins: [babel()]
};
