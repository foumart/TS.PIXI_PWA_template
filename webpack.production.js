/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const webpack = require("webpack");
const path = require("path");

const fileSystem = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const RemovePlugin = require('remove-files-webpack-plugin');

const pkg = JSON.parse(fileSystem.readFileSync(path.join(__dirname, "package.json"), "utf-8"));

module.exports = (env) => {
	return {
		mode: env.mode,

		module: {
			rules: [
				{
					enforce: "pre",
					test: /\.(js|jsx|ts|tsx)$/,
					exclude: /node_modules/,
					loader: "eslint-loader",
					options: {
						emitError: true,
						emitWarning: true,
						failOnError: true,
						failOnWarning: true,
					},
				},
				{
					test: /\.(js|jsx|ts|tsx)$/,
					use: [
						{
							loader: "babel-loader",
						},
					],
					exclude: /node_modules/,
				},
				{
					test: /\.tsx?$/,
					use: "ts-loader",
					exclude: /node_modules/,
				},
			],
		},

		output: {
			path: path.resolve(__dirname, "./dist/"),
			filename: "game.[contenthash].js",
		},

		plugins: [
			new HtmlWebpackPlugin({
				filename: "index.html",
				hash: true,
				template: "dist/index.tmp.html",
			}),

			new MiniCssExtractPlugin({
				filename: "[name].[contenthash].css",
			}),

			new OptimizeCssAssetsPlugin({
				assetNameRegExp: /\.css$/i,
				cssProcessor: require("cssnano"),
				cssProcessorPluginOptions: {
					preset: ["default", { discardComments: { removeAll: true } }],
				},
				canPrint: true,
			}),

			new webpack.DefinePlugin({
				VERSION: JSON.stringify(pkg.version),
			}),

			new webpack.ProgressPlugin(),

			new RemovePlugin({
				after: {
					include: [
						'dist/index.tmp.html'
					]
				}
			})
		],
	};
};
