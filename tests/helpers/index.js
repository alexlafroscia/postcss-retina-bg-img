const { resolve } = require('path');
const postcss = require('postcss');
const bgImage = require('../../lib/postcss-plugin.js');
const { DEFAULT_MEDIA_QUERY } = bgImage;

const baseOptions = {
  retinaSuffix: '@2x',
  mediaQuery: DEFAULT_MEDIA_QUERY,
  assetDirectory: resolve(__dirname, '../fixtures')
};

function run(input, options) {
  return postcss([ bgImage(options) ])
    .process(input, {from: 'tests/test.css'})
    .then((result) => {
      return {
        output: postcss.parse(result.css),
        warnings: result.warnings()
      };
    });
}

module.exports = { run, baseOptions };