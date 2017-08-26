import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  output: {
    file: pkg.bin['kronos-cluster-node'],
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [nodeResolve(), commonjs()],
  external: ['kronos-service-manager'],
  input: pkg.module
};
