import { resolve } from 'path';
import { expect } from 'chai';
import postcss from 'postcss';
import bgImage, { DEFAULT_MEDIA_QUERY } from '../../lib/index.js';

export const baseOptions = {
  retinaSuffix: '@2x',
  mediaQuery: DEFAULT_MEDIA_QUERY,
  assetDirectory: resolve(__dirname, '../fixtures')
};

export function run(input, options) {
  return postcss([ bgImage(options) ])
    .process(input)
    .then((result) => {
      expect(result.warnings()).to.be.empty;

      return {
        output: postcss.parse(result.css),
        warnings: result.warnings()
      };
    });
}
