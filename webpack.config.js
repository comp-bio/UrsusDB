const debug = process.env.NODE_ENV !== "production";
const path = require("path");
const WebpackAssetsManifest = require("webpack-assets-manifest");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function entrySources(items) {
  if (debug) items.push("webpack-dev-server/client");
  return items;
}

module.exports = {
  mode: debug ? "development" : "production",

  entry: {
    admin: entrySources([`./assets/js/admin.js`]),
    client: entrySources([`./assets/js/client.js`]),
  },

  output: {
    path: path.join(__dirname, `build`),
    filename: "[name]-[fullhash].js",
  },

  devtool: "source-map",

  devServer: {
    static: path.resolve(__dirname, "build"),
    port: 9410,
    historyApiFallback: true,
    proxy: {
      "/": {
        target: "http://0.0.0.0:9400/",
        changeOrigin: true,
      },
      "/api": {
        target: "http://0.0.0.0:9400/",
        changeOrigin: true,
      },
      "/media": {
        target: "http://0.0.0.0:9400/",
        changeOrigin: true,
      },
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, x-id, Content-Length, X-Requested-With",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
      },
      {
        test: /\.(txt|sql)$/,
        use: "raw-loader",
      },
      {
        test: /\.svg$/,
        loader: "svg-react-loader",
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "img",
            esModule: false,
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: debug ? "style-loader" : MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
              importLoaders: 1,
              modules: {
                mode: "icss",
              },
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(tpl)$/,
        use: {
          loader: "html-loader",
          options: {
            interpolate: true,
          },
        },
      },
    ],
  },

  plugins: [
    new WebpackAssetsManifest({
      publicPath: true,
      writeToDisk: true,
      output: path.join(__dirname, `build/manifest.json`),
    }),
    new MiniCssExtractPlugin({
      filename: "[name]-[fullhash].css",
      chunkFilename: "[id].css",
    }),
  ],
};
