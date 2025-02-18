const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require("webpack");

module.exports = {
    cache: {
        type: 'filesystem'
    },
    devtool: "source-map",
    entry: './src/client/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        plugins: [ 
            new TsconfigPathsPlugin()
        ],
        extensions: [ '.ts', '.js'],
    },
    output: {
        sourceMapFilename: "bundle.js.map",
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'android'),
    },
    plugins: [
        new webpack.DefinePlugin({
            "DEFINES": {
                android: true
            }
        })
    ],
    mode: 'development',
    optimization: {
        minimize: false
    },
};