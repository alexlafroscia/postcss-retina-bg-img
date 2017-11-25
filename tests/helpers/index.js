const { resolve } = require('path');
const postcss = require('postcss');
const bgImage = require('../../lib/postcss-plugin.js');
const { DEFAULT_MEDIA_QUERY } = bgImage;

const baseOptions = {
  retinaSuffix: '@2x',
  mediaQuery: DEFAULT_MEDIA_QUERY,
  assetDirectory: resolve(__dirname, '../fixtures')
};

async function run(input, options) {
  const result = await postcss([bgImage(options)]).process(input, {
    from: 'tests/test.css'
  });

  return {
    output: postcss.parse(result.css),
    warnings: result.warnings()
  };
}

module.exports = { run, baseOptions };
