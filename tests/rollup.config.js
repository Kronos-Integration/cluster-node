export default {
  input: 'tests/**/*-test.js',
  external: ['ava'],
  plugins: [],

  output: {
    file: 'build/test-bundle.js',
    format: 'cjs',
    sourcemap: true
  }
};
