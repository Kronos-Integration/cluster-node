import pkg from './package.json';
import json from 'rollup-plugin-json';

export default {
  output: {
    file: pkg.bin['kronos-cluster-node'],
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [json()],
  external: ['kronos-service-manager', 'config-expander', 'npm-package-walker'],
  input: pkg.module
};
