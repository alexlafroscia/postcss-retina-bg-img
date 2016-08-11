import path from 'path';

import { describe, it } from 'mocha';
import { expect } from 'chai';

import findRetinaImage from '../lib/find-retina-image.js';

function fixturePath(fileName) {
  return path.join(__dirname, 'fixtures', fileName);
}

describe('finding the retina image', function() {
  it('works when a single suffix is provided', function() {
    const retinaName = findRetinaImage(fixturePath('file-with-one-retina.txt'), '@2x');

    expect(retinaName).to.equal(fixturePath('file-with-one-retina@2x.txt'));
  });

  it('works when multiple suffixes are provided', function() {
    const retinaName = findRetinaImage(fixturePath('file-with-other-retina.txt'), ['@2x', '_2x']);

    expect(retinaName).to.equal(fixturePath('file-with-other-retina_2x.txt'));
  });

  it('fails to locate a file without a matching retina version', function() {
    const retinaName = findRetinaImage(fixturePath('file-without-retina.txt'), '@2x');

    expect(retinaName).to.be.undefined;
  });

  describe('default options', function() {
    it('falls back to using `@2x` for the retina suffix', function() {
      const retinaName = findRetinaImage(fixturePath('file-with-one-retina.txt'));

      expect(retinaName).to.equal(fixturePath('file-with-one-retina@2x.txt'));
    });
  });
});
