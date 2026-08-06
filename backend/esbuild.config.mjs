/** @param {import('serverless')} serverless */
export default function (serverless) {
  return {
    bundle: true,
    minify: false,
    sourcemap: true,
    target: "node20",
    exclude: [],
  };
}
