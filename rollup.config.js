import builtins from "builtin-modules";
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
    banner:
      '#!/bin/sh\n":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@"',
    interop: false
  },
  plugins: [
    commonjs(),
    json({
      include: "package.json",
      preferConst: true,
      compact: true
    }),
    cleanup({
      extensions: ['js','mjs','jsx','tag']
    }),
    executable()
  ],
  external: [
    ...builtins,
    "kronos-service-manager",
    "npm-package-walker",
    "rebirth",
    "network-address",
    "caporal"
  ],
  input: pkg.module
};
