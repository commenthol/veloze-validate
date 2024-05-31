import terser from '@rollup/plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
import sourcemaps from 'rollup-plugin-sourcemaps'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: './dist/index.js',
        format: 'es'
      }
    ],
    plugins: [cleanup()]
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: './dist/index.min.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [terser(), sourcemaps()]
  },
  {
    input: 'src/validate.js',
    output: [
      {
        file: './dist/validate.js',
        format: 'es'
      }
    ],
    plugins: [cleanup()]
  },
  {
    input: 'src/validate.js',
    output: [
      {
        file: './dist/validate.min.js',
        format: 'es',
        sourcemap: true
      }
    ],
    plugins: [terser(), sourcemaps()]
  }
]
