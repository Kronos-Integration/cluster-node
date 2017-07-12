import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  banner: '#!/usr/bin/env node',
  targets: [
    {
      dest: pkg.bin['kronos-cluster-node'],
      format: 'cjs'
    }
  ],
  plugins: [nodeResolve(), commonjs()],
  external: ['kronos-service-manager']
};
