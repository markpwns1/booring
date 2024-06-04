const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    cache: {
        type: 'filesystem'
    },
    devtool: "source-map",
    entry: './src/server/index.ts',
    target: "node",
    externals: [ nodeExternals() ],
    externalsPresets: {
        node: true // in order to ignore built-in modules like path, fs, etc. 
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        plugins: [ new TsconfigPathsPlugin() ],
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        sourceMapFilename: "server.bundle.js.map",
        filename: 'server.bundle.js',
        path: __dirname,
    },
    mode: 'production',
};