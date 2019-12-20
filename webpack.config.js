const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
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
            'style.css',
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
