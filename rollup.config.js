import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const extensions = ['.js', '.ts', '.tsx'];

export default [
  {
    input: './src/index.tsx',
    output: {
      file: './dist/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'MountingTransition',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
    plugins: [
      resolve({
        extensions,
      }),
      babel({
        babelrc: false,
        presets: [
          '@babel/preset-env',
          '@babel/preset-typescript',
          '@babel/preset-react',
        ],
        babelHelpers: 'bundled',
        extensions,
      }),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: './src/index.tsx',
    output: {
      file: './dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        babelrc: false,
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-runtime'],
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    external: ['react', 'react-dom'],
  },
];
