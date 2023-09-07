import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import {defineConfig} from 'vite'
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
    // define: {
    //     global: {},
    //     process: {
    //         env: {
    //             NODE_DEBUG: false,
    //         },
    //     },
    // },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis'
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true
                })
            ]
        }
    },
    plugins: [
        vue(),
        legacy()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            assets: path.resolve(__dirname, './public/assets'),
            fs: path.resolve(__dirname, './node_modules/browserify-fs'),
            path: path.resolve(__dirname, './node_modules/path-browserify'),
            crypto: path.resolve(__dirname, './node_modules/crypto-browserify'),
            assert: path.resolve(__dirname, './node_modules/assert'),
            url: path.resolve(__dirname, './node_modules/url'),
            stream: path.resolve(__dirname, './node_modules/stream-browserify'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom'
    }
})
