import { describe, it } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { baseOptions, run } from './helpers';

import postcss from 'postcss';
import bgImage, { DEFAULT_MEDIA_QUERY } from '../lib/index.js';

chai.use(chaiAsPromised);

describe('PostCSS Plugin', function() {
  it('does not add the media query if the retina image is not found', function() {
    const css = `
      a {
        background-image: url('file-without-retina.txt');
      }
    `;

    return run(css, baseOptions).then(function(output) {
      expect(output.rules.length).to.equal(1);
    });
  });

  describe('`background-image` property', function() {
    it('adds the retina version of the provided image', function() {
      const css = `
        a {
          background-image: url('file-with-one-retina.txt');
        }
      `;

      return run(css, baseOptions).then(function(output) {
        const mq = output.rules[1];
        expect(mq.type).to.equal('media');

        const [ mqRule ] = mq.rules;
        expect(mqRule.selectors).to.deep.equal(['a']);

        const [ decl ] = mqRule.declarations;
        expect(decl.property).to.equal('background-image');
        expect(decl.value).to.equal("url('file-with-one-retina@2x.txt')");
      });
    });
  });

  describe('`background` property', function() {
    it('adds the retina version of the provided image', function() {
      const css = `
        a {
          background: url('file-with-one-retina.txt');
        }
      `;

      return run(css, baseOptions).then(function(output) {
        const mq = output.rules[1];
        expect(mq.type).to.equal('media');

        const [ mqRule ] = mq.rules;
        expect(mqRule.selectors).to.deep.equal(['a']);

        const [ decl ] = mqRule.declarations;
        expect(decl.property).to.equal('background-image');
        expect(decl.value).to.equal("url('file-with-one-retina@2x.txt')");
      });
    });

    it('does add anything if an image is not present', function() {
      const css = `
        a {
          background: red;
        }
      `;

      return run(css, baseOptions).then(function(output) {
        expect(output.rules.length).to.equal(1);

        const [ rule ] = output.rules;
        const [ decl ] = rule.declarations;

        expect(decl.value).to.equal('red');
      });
    });

    it('adds the retina image even if the property contains additional information', function() {
      const css = `
        a {
          background: url('file-with-one-retina.txt') no-repeat center center;
        }
      `;

      return run(css, baseOptions).then(function(output) {
        const mq = output.rules[1];
        expect(mq.type).to.equal('media');

        const [ mqRule ] = mq.rules;
        expect(mqRule.selectors).to.deep.equal(['a']);

        const [ decl ] = mqRule.declarations;
        expect(decl.property).to.equal('background-image');
        expect(decl.value).to.equal("url('file-with-one-retina@2x.txt')");
      });
    });
  });

  describe('options', function() {
    it('can be given an retina suffix', function() {
      const css = `
        a {
          background: url('file-with-other-retina.txt');
        }
      `;

      return run(css, {
        retinaSuffix: '_2x',
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: 'fixtures'
      }).then(function(output) {
        const mq = output.rules[1];
        const [ mqRule ] = mq.rules;
        const [ decl ] = mqRule.declarations;

        expect(decl.value).to.equal("url('file-with-other-retina_2x.txt')");
      });
    });

    it('can be given a media query to use', function() {
      const css = `
        a {
          background: url('file-with-one-retina.txt');
        }
      `;

      return run(css, {
        retinaSuffix: '@2x',
        mediaQuery: 'foo',
        assetDirectory: 'fixtures'
      }).then(function(output) {
        const mq = output.rules[1];

        expect(mq.media).to.equal('foo');
      });
    });

    describe('default options', function() {
      it('errors if an asset directory is not specified', function() {
        const processCSS = postcss([ bgImage({}) ]).process('a {}');

        return expect(processCSS).to.be.rejectedWith('You must provide an asset directory');
      });

      it('uses the "CSS-Tricks" recommended media query if none is provided', function() {
        const css = `
          a {
            background-image: url('file-with-one-retina.txt');
          }
        `;

        return run(css, {
          retinaSuffix: '@2x',
          assetDirectory: 'fixtures'
        }).then(function(output) {
          const mq = output.rules[1];
          const [ mqRule ] = mq.rules;

          expect(mqRule.value).to.equal(DEFAULT_MEDIA_QUERY);
        });
      });

      it('uses `@2x` as the default retina suffix if none is provided', function() {
        const css = `
          a {
            background-image: url('file-with-one-retina.txt');
          }
        `;

        return run(css, {
          mediaQuery: DEFAULT_MEDIA_QUERY,
          assetDirectory: 'fixtures'
        }).then(function(output) {
          const mq = output.rules[1];
          const [ mqRule ] = mq.rules;
          const [ decl ] = mqRule.declarations;

          expect(decl.value).to.equal("url('file-with-one-retina@2x.txt')");
        });
      });
    });
  });
});
