import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  banner: '#!/usr/bin/env node',

  output: {
    file: pkg.main,
    format: 'cjs'
  },

  plugins: [nodeResolve(), commonjs()],
  external: ['kronos-service-manager'],
  input: pkg.module
};
