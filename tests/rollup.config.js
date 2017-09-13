export default {
  entry: 'tests/simple-test.js',
  external: ['ava'],
  plugins: [],
  format: 'cjs',
  dest: 'build/test-bundle.js',
  sourceMap: true
};
