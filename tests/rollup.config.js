export default {
  input: 'tests/simple-test.js',
  external: ['ava', 'kronos-service-manager', 'config-expander'],
  output: {
    file: 'build/simple-test.js',
    format: 'cjs',
    sourcemap: true
  }
};
