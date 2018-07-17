import istanbul from 'rollup-plugin-istanbul';

import multiEntry from 'rollup-plugin-multi-entry';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import base from '../rollup.config.js';

export default [
  base,
  {
    input: 'tests/simple-test.js',
    external: [
      'ava',
      'kronos-service-manager',
      'config-expander',
      'npm-package-walker'
    ],
    output: {
      file: 'build/simple-test.js',
      format: 'cjs',
      sourcemap: true
    }
  }
];
