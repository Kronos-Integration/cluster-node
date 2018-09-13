import cleanup from "rollup-plugin-cleanup";
import pkg from "./package.json";
import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import executable from "rollup-plugin-executable";

export default {
  output: {
    file: pkg.bin["kronos-cluster-node"],
    format: "cjs",
    banner: "#!/usr/bin/env node --experimental-modules --experimental-worker",
    interop: false
  },
  plugins: [resolve(), commonjs(), json(), cleanup(), executable()],
  external: [
    "os",
    "child_process",
    "path",
    "kronos-service-manager",
    "config-expander",
    "npm-package-walker"
  ],
  input: pkg.module
};
