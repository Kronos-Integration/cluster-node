import pkg from './package.json';

export default {
  output: {
    file: pkg.bin['kronos-cluster-node'],
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  external: ['kronos-service-manager', 'config-expander', 'npm-package-walker'],
  input: pkg.module
};
