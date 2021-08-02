/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-inferrable-types*/
const path = require("path");

const merge = require("webpack-merge").merge;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) => {
	const config = {
		entry: "./src/app/index.ts",

		resolve: {
			extensions: [".ts", ".tsx", ".js", ".json"],
		},

		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						"css-loader",
					],
				},
			],
		},
		optimization: {
			splitChunks: {
				chunks: "all",
			},
		},

		plugins: [

		],
	};

	const envConfig = require(path.resolve(__dirname, `./webpack.${env.mode}.js`))(env);

	const mergedConfig = merge(config, envConfig);

	return mergedConfig;
};
