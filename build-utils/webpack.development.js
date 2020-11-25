const RR = require("@pmmmwh/react-refresh-webpack-plugin");
const { HotModuleReplacementPlugin: HMR } = require("webpack");

module.exports = ({ mode, contentBase, publicDir }) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devtool: "source-map",
  plugins: [new HMR(), new RR()],
  devServer: {
    contentBase,
    contentBasePublicPath: `/${publicDir}`,
    https: true,
    quiet: true,
    noInfo: true,
    hot: true,
    hotOnly: true,
    inline: true,
    overlay: true,
    clientLogLevel: "error",
    publicPath: "/",
  },
});
