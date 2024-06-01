const path = require("path");

module.exports = {
  entry: "./app.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "static/js"), // Update output path
  },
  externals: {
    three: "THREE", // Ensure Three.js is available as global variable
  },
};
