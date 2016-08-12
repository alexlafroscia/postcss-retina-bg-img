import { describe, it } from 'mocha';
import { expect } from 'chai';

import { isFullUrlPath, isAbsoluteFilePath, makeAbsoluteFilePath } from '../lib/utils/image-url';

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

describe('isAbsoluteFilePath', function() {
  it('accepts an absolute file path', function() {
    expect(isAbsoluteFilePath('/foo')).to.be.ok;
  });

  it('rejects a relative file path', function() {
    expect(isAbsoluteFilePath('foo')).not.to.be.ok;
  });
});

describe('makeAbsoluteFilePath', function() {
  it('converts a relative path into an absolute one', function() {
    expect(makeAbsoluteFilePath('foo')).to.equal('/foo');
  });

  it('does not modify an absolute path', function() {
    expect(makeAbsoluteFilePath('/foo')).to.equal('/foo');
  });
});
