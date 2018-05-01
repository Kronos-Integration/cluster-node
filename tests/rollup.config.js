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
