import { describe, it } from 'mocha';
import { expect } from 'chai';

import { isFullUrlPath } from '../lib/image-url-utils';

describe('isFullUrlPath', function() {
  it('accepts an HTTP string', function() {
    expect(isFullUrlPath('http://foo.com/bar.png')).to.be.ok;
  });

  it('accepts an HTTPS string', function() {
    expect(isFullUrlPath('https://foo.com/bar.png')).to.be.ok;
  });

  it('rejects a relative path', function() {
    expect(isFullUrlPath('foo.png')).not.to.be.ok;
  });

  it('rejects an absolute path', function() {
    expect(isFullUrlPath('/foo.png')).not.to.be.ok;
  });
});
