import babel from 'rollup-plugin-babel';
import multiEntry from 'rollup-plugin-multi-entry';

export default {
  input: 'tests/**/*-test.js',
  external: ['ava'],
  plugins: [
    babel({
      babelrc: false,
      presets: ['stage-3'],
      exclude: 'node_modules/**'
    }),
    multiEntry()
  ],
  dest: 'build/test-bundle.js',
  sourceMap: true,
  output: {
    file: 'build/test-bundle.js',
    format: 'cjs',
    sourcemap: true
  }
};
