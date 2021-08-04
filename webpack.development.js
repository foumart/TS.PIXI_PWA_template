/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const webpack = require("webpack");
const path = require("path");

const fileSystem = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const pkg = JSON.parse(fileSystem.readFileSync(path.join(__dirname, "package.json"), "utf-8"));

module.exports = (env) => {
    const devConfig = {
        mode: env.mode,

        devtool: "inline-source-map",

        devServer: {
            open: true,
            devMiddleware: {
                writeToDisk: true
            },
            static: "./dev/"
        },

        module: {
            rules: [
                {
                    enforce: "pre",
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    loader: "eslint-loader"
                },
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                }
            ]
        },

        output: {
            path: path.resolve(__dirname, "./dev/"),
            filename: "[name].js"
        },

        plugins: [
            new HtmlWebpackPlugin({
                filename: "index.html",
                hash: true,
                template: "dev/index.tmp.html"
            }),

            new MiniCssExtractPlugin({
                filename: "[name].css"
            }),

            new webpack.DefinePlugin({
                VERSION: JSON.stringify(pkg.version + "dev")
            })
        ]
    };

    return devConfig;
};
