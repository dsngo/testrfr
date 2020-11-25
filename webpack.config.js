const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ProgressPlugin } = require("webpack");
const { merge } = require("webpack-merge");
const presetConfig = require("./build-utils/loadPresets");
const path = (uri) => require("path").resolve(__dirname, uri);

const modeConfig = (options) =>
  require(`./build-utils/webpack.${options.mode}`)(options);

const scripts = (mode) => {
  const modeStr = mode == "production" ? `${mode}.min` : mode;

  // const baseCdns = [
  //   "assets/lib/adapter-latest.js",
  //   "assets/lib/mqttws31.min.js",
  //   "assets/lib/JVLib.dev.min.js",
  // ];
  const baseCdns = [];

  const cdns = [
    `https://unpkg.com/react@17/umd/react.${modeStr}.js`,
    `https://unpkg.com/react-dom@17/umd/react-dom.${modeStr}.js`,
    "https://unpkg.com/@emotion/react@11/dist/emotion-react.umd.min.js",
    "https://unpkg.com/xstate@4/dist/xstate.js",
  ].filter(Boolean);

  // return (mode == "production" ? cdns.concat(baseCdns) : baseCdns)
  return cdns
    .concat(baseCdns)
    .map(
      (e) => `<script crossorigin type="text/javascript" src="${e}"></script>`
    )
    .join("");
};

const target = process.env.NODE_ENV == "development" ? "web" : "browserslist";
const srcDir = path("src");
const contentBase = `${srcDir}/resource`;
const publicDir = "assets";
const distPath = `/dist`;
const htmlTemplate = `${srcDir}/template.html`;

const entry = {
  main: `${srcDir}/index.js`,
};

const output = (mode) => {
  const dev = mode == "development";

  return {
    path: distPath,
    // chunkFilename: `${publicDir}/js/[name].[contenthash:8].lazy-chunk.js`,
    chunkFilename: (pathData) => {
      // dev && console.log("async", pathData);
      // debugger;

      return `${publicDir}/js/${
        dev ? "[name]." : ""
      }[contenthash:8].dynamic.js`;
    },
    filename: (pathData) => {
      // dev && console.log("sync", pathData);

      return `${publicDir}/js/${
        dev ? "[name]." : ""
      }[name].[contenthash:8].async.js`;
    },
  };
};

const BabelLoader = {
  test: /\.jsx?$/i,
  use: {
    loader: "babel-loader",
    options: { cacheDirectory: true },
  },
  exclude: /node_modules/,
};

const UrlLoader = {
  test: /\.(bmp|gif|jpe?g|svg|png)$/i,
  loader: "url-loader",
  options: {
    limit: 5120,
    name: "[name].[contenthash:8].[ext]",
    outputPath: `${publicDir}/img`,
    // outputPath: (url, resourcePath, context) => {
    //   if (/family1\.png/.test(resourcePath)) return "assets/family1.png";

    //   return `${publicDir}/img/${url}`;
    // },
  },
};

const FileLoader = [
  {
    test: /lotties\/.*\.json$/i,
    loader: "file-loader",
    type: "javascript/auto",
    options: {
      name: "[name].[ext]",
      outputPath: "assets/animation",
    },
  },
];

const plugins = (mode) =>
  [
    new HtmlWebpackPlugin({
      template: htmlTemplate,
      title: mode != "production" && " dev",
      scripts: scripts(mode),
      filename: "index.html",
      // favicon,
      jsExtension: ".gz",
    }),
    new ProgressPlugin(),
    mode == "production" &&
      new CopyPlugin({
        patterns: [
          {
            from: `${contentBase}/lib`,
            to: `${publicDir}/lib`,
          },
          {
            from: `${contentBase}/imgs/mock/family1.png`,
            to: `${publicDir}`,
          },
        ],
      }),
  ].filter(Boolean);

module.exports = (
  { mode, presets, build } = { mode: "production", presets: [] }
) => {
  if (!build) {
    build = "Please yell at Daniel!";
  }

  if (process.env.NODE_ENV) {
    mode = process.env.NODE_ENV;
  }

  const dev = mode == "development";

  return merge(
    {
      mode,
      entry,
      output: output(mode),
      target,
      plugins: plugins(mode),
      stats: {
        preset: "normal",
        moduleTrace: true,
        errorDetails: true,
        assets: true,
        assetsSort: "id",
        colors: true,
      },
      module: {
        rules: [BabelLoader, UrlLoader, ...FileLoader],
      },
      externals: {
        // "@emotion/react": "emotionReact",
        // xstate: "XState",
        // "lottie-web": "lottie",
        // react: "React",
        // "react-dom": "ReactDOM",
        // ...(!dev && { react: "React" }),
        // ...(!dev && { "react-dom": "ReactDOM" }),
      },
    },
    modeConfig({ mode, contentBase, publicDir }),
    presetConfig({ mode, presets })
  );
};
