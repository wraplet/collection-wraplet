const webpack = require('webpack');
const path = require('path');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    devtool: 'source-map',
    entry: './src/index.ts',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    resolveLoader: {
        modules: ['node_modules', path.resolve(__dirname, 'loaders')],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        library: {
            type: 'umd',
            name: 'collection-wraplet',
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: '/node_modules/',
                options: {
                    configFile: "tsconfig.build.json"
                }
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            BASEPATH: JSON.stringify(''),
        }),
    ],
    externals: Object.keys(require('./package.json').dependencies)
        .reduce(
            function (acc, cur) {
                acc[cur] = cur
                return acc
            },
            {}
        ),
};
