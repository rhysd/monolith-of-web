import * as webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import * as path from 'path';

const config: webpack.Configuration = {
    mode: 'development',
    entry: {
        popup: './popup.ts',
        bootstrap: './bootstrap.ts',
        content: './content.ts',
    },
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.wasm'],
    },
    plugins: [
        new CopyWebpackPlugin([
            'background.html',
            'node_modules/bulma/css/bulma.min.css',
            'node_modules/@mdi/font/css/materialdesignicons.min.css',
            {
                from: 'node_modules/@mdi/font/fonts/materialdesignicons-webfont.woff2',
                to: 'fonts/',
            },
            'node_modules/balloon-css/balloon.min.css',
            { from: 'icon', to: 'icon' },
            'manifest.json',
            'popup.html',
            'popup.css',
        ]),
    ],
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        disableHostCheck: true,
        writeToDisk: true, // Useful for Chrome extension
    },
};

export default config;
