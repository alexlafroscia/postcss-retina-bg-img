import path from 'path';

import { describe, it } from 'mocha';
import { expect } from 'chai';

import findRetinaImage from '../lib/find-retina-image.js';

const fixturePath = path.join(__dirname, 'fixtures');

describe('finding the retina image', function() {
  it('works with relative paths', function() {
    const retinaName = findRetinaImage('./file-with-one-retina.txt', fixturePath, '@2x');

    expect(retinaName).to.equal('./file-with-one-retina@2x.txt');
  });

  it('works when a single suffix is provided', function() {
    const retinaName = findRetinaImage('file-with-one-retina.txt', fixturePath, '@2x');

    expect(retinaName).to.equal('file-with-one-retina@2x.txt');
  });

  it('works when multiple suffixes are provided', function() {
    const retinaName = findRetinaImage('file-with-other-retina.txt', fixturePath, ['@2x', '_2x']);

    expect(retinaName).to.equal('file-with-other-retina_2x.txt');
  });

  it('fails to locate a file without a matching retina version', function() {
    const retinaName = findRetinaImage('file-without-retina.txt', fixturePath, '@2x');

    expect(retinaName).to.be.undefined;
  });

  describe('default options', function() {
    it('falls back to using `@2x` for the retina suffix', function() {
      const retinaName = findRetinaImage('file-with-one-retina.txt', fixturePath);

      expect(retinaName).to.equal('file-with-one-retina@2x.txt');
    });
  });
});
