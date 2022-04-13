import typescript from '@rollup/plugin-typescript';
import reactRefresh from '@vitejs/plugin-react-refresh';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig, loadEnv} from 'vite';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import inject from '@rollup/plugin-inject';

const production = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, 'env');

  // Plugin so we can use default %env_variable%
  const htmlEnvPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/%(.*?)%/g, (_, p1) => {
          return env[p1];
        });
      },
    };
  };

  return {
    base: '',
    plugins: [
      // ↓ Needed for development mode
      !production &&
        nodePolyfills({
          include: [
            'node_modules/**/*.js',
            new RegExp('node_modules/.vite/.*js'),
          ],
        }),
      htmlEnvPlugin(),
      reactRefresh(),
      tsconfigPaths(),
      typescript({tsconfig: './tsconfig.json'}),
    ],
    optimizeDeps: {
      exclude: ['web3'], // <= The libraries that need shimming should be excluded from dependency optimization.
    },
    build: {
      sourcemap: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        plugins: [inject({Buffer: ['Buffer', 'Buffer']})],
      },
      // ↓ Needed for build if using WalletConnect and other providers
    },
  };
});
