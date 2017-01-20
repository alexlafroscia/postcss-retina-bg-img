const path = require('path');

const { describe, it } = require('mocha');
const { expect } = require('chai');

const findRetinaImage = require('../lib/find-retina-image.js');

const fixturePath = path.join(__dirname, 'fixtures');

describe('finding the retina image', function() {
  it('works with relative paths', function() {
    const retinaName = findRetinaImage('./file-with-one-retina.png', fixturePath, '@2x');

    expect(retinaName).to.equal('./file-with-one-retina@2x.png');
  });

  it('works when a single suffix is provided', function() {
    const retinaName = findRetinaImage('file-with-one-retina.png', fixturePath, '@2x');

    expect(retinaName).to.equal('file-with-one-retina@2x.png');
  });

  it('works when multiple suffixes are provided', function() {
    const retinaName = findRetinaImage('file-with-other-retina.png', fixturePath, ['@2x', '_2x']);

    expect(retinaName).to.equal('file-with-other-retina_2x.png');
  });

  it('fails to locate a file without a matching retina version', function() {
    const retinaName = findRetinaImage('file-without-retina.png', fixturePath, '@2x');

    expect(retinaName).to.be.undefined;
  });

  it('works when the filename shows up in the filepath', function() {
    const retinaName = findRetinaImage('subfolder/2/2.png', fixturePath, '@2x');

    expect(retinaName).to.equal('subfolder/2/2@2x.png');
  });

  describe('default options', function() {
    it('falls back to using `@2x` for the retina suffix', function() {
      const retinaName = findRetinaImage('file-with-one-retina.png', fixturePath);

      expect(retinaName).to.equal('file-with-one-retina@2x.png');
    });
  });
});
