import { resolve } from 'path';
import postcss from 'postcss';
import bgImage, { DEFAULT_MEDIA_QUERY } from '../../lib/postcss-plugin.js';

export const baseOptions = {
  retinaSuffix: '@2x',
  mediaQuery: DEFAULT_MEDIA_QUERY,
  assetDirectory: resolve(__dirname, '../fixtures')
};

export function run(input, options) {
  return postcss([ bgImage(options) ])
    .process(input)
    .then((result) => {
      return {
        output: postcss.parse(result.css),
        warnings: result.warnings()
      };
    });
}
