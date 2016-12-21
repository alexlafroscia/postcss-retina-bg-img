import { describe, it } from 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { baseOptions, run } from './helpers';

import postcss from 'postcss';
import bgImage, { DEFAULT_MEDIA_QUERY } from '../lib/postcss-plugin.js';

chai.use(chaiAsPromised);

describe('PostCSS Plugin', function() {
  it('does not add the media query if the retina image is not found', function() {
    const css = `
      a {
        background-image: url('file-without-retina.png');
      }
    `;

    return run(css, baseOptions).then(function({ output, warnings }) {
      expect(output.nodes.length).to.equal(1);
      expect(output.nodes[0].type).to.equal('rule');

      expect(warnings.length).to.equal(1);

      const [ warning ] = warnings;

      expect(warning.line).to.equal(3);
      expect(warning.column).to.equal(9);
      expect(warning.text).to.equal('Could not find retina verion for `file-without-retina.png`');
    });
  });

  it('merges media queries', function() {
    const css = `
      @media (min-width: 600px) {
        a {
          background-image: url('file-with-one-retina.png');
        }
      }
    `;

    return run(css, baseOptions).then(function({ output }) {
      const [ originalMqRule, newMqRule ] = output.nodes;

      expect(originalMqRule.params).to.equal('(min-width: 600px)');
      expect(newMqRule.params).to.equal('(-webkit-min-device-pixel-ratio: 2) and (min-width: 600px), (min-resolution: 192dpi) and (min-width: 600px)');

      expect(originalMqRule.nodes[0].nodes[0].value).to.equal("url('file-with-one-retina.png')");
      expect(newMqRule.nodes[0].nodes[0].value).to.equal("url('file-with-one-retina@2x.png')");

      output.nodes.forEach(function(mq) {
        expect(mq.type).to.equal('atrule');
        expect(mq.name).to.equal('media');
        expect(mq.nodes.length).to.equal(1);

        const [ firstRule ] = mq.nodes;
        expect(firstRule.selector).to.equal('a');

        const [ decl ] = firstRule.nodes;
        expect(decl.prop).to.equal('background-image');
      });
    });
  });

  describe('handling different types of background images', function() {
    it('maintains absolute URL paths to images', function() {
      const css = `
        a {
          background-image: url('/file-with-one-retina.png');
        }
      `;

      return run(css, baseOptions).then(function({ output }) {
        const [ , mq ] = output.nodes;
        const [ retinaRule ] = mq.nodes;
        const [ bgDecl ] = retinaRule.nodes;

        expect(bgDecl.value).to.equal("url('/file-with-one-retina@2x.png')");
      });
    });

    it('ignores full URL paths to images', function() {
      const css = `
        a {
          background-image: url('http://foo.com/bar.jpg');
        }

        b {
          background-iamge: url('https://foo.com/bar.jpg');
        }
      `;

      return run(css, baseOptions).then(function({ output }) {
        expect(output.nodes.length).to.equal(2);
      });
    });

    it('finds images with relative paths', function() {
      const css = `
        a {
          background-image: url('./fixtures/file-with-one-retina.png');
        }
      `;

      return run(css, {}).then(function({ output }) {
        const [ , mq ] = output.nodes;
        const [ retinaRule ] = mq.nodes;
        const [ bgDecl ] = retinaRule.nodes;

        expect(bgDecl.value).to.equal("url('./fixtures/file-with-one-retina@2x.png')");
      });
    });
  });

  describe('`background-image` property', function() {
    it('adds the retina version of the provided image', function() {
      const css = `
        a {
          background-image: url('file-with-one-retina.png');
        }
      `;

      return run(css, baseOptions).then(function({ output }) {
        const mq = output.nodes[1];
        expect(mq.type).to.equal('atrule');
        expect(mq.name).to.equal('media');

        const [ mqRule ] = mq.nodes;
        expect(mqRule.selector).to.equal('a');

        const [ decl ] = mqRule.nodes;
        expect(decl.prop).to.equal('background-image');
        expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
      });
    });
  });

  describe('`background` property', function() {
    it('adds the retina version of the provided image', function() {
      const css = `
        a {
          background: url('file-with-one-retina.png');
        }
      `;

      return run(css, baseOptions).then(function({ output }) {
        const mq = output.nodes[1];
        expect(mq.type).to.equal('atrule');
        expect(mq.name).to.equal('media');

        const [ mqRule ] = mq.nodes;
        expect(mqRule.selector).to.equal('a');

        const [ decl ] = mqRule.nodes;
        expect(decl.prop).to.equal('background-image');
        expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
      });
    });

    it('does not add anything if an image is not present', function() {
      const css = `
        a {
          background: red;
        }
      `;

      return run(css, baseOptions).then(function({ output }) {
        expect(output.nodes.length).to.equal(1);

        const [ rule ] = output.nodes;
        const [ decl ] = rule.nodes;

        expect(decl.value).to.equal('red');
      });
    });

    it('adds the retina image even if the property contains additional information', function() {
      const css = `
        a {
          background: url('file-with-one-retina.png') no-repeat center center;
        }
      `;

      return run(css, baseOptions).then(function({ output }) {
        const mq = output.nodes[1];
        expect(mq.type).to.equal('atrule');
        expect(mq.name).to.equal('media');

        const [ mqRule ] = mq.nodes;
        expect(mqRule.selector).to.equal('a');

        const [ decl ] = mqRule.nodes;
        expect(decl.prop).to.equal('background-image');
        expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
      });
    });
  });

  describe('`list-style-image` property', function() {
    it('adds the retina version of the provided image', function() {
      const css = `
        li {
          list-style-image: url('file-with-one-retina.png');
        }
      `;

      return run(css, baseOptions).then(function({ output }) {
        const [ , mq ] = output.nodes;
        const [ mqRule ] = mq.nodes;
        const [ decl ] = mqRule.nodes;

        expect(output.nodes.length).to.equal(2);
        expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
      });
    });
  });

  describe('avoiding existing retina images', function() {
    it('does not add a retina rule of one already exists for the selector', function() {
      const providedRetinaBackgroundProperty = "url('some-other-retina-image.png')";
      const css = `
        a {
          background-image: url('file-with-one-retina.png');
        }

        @media ${DEFAULT_MEDIA_QUERY} {
          a {
            background-image: ${providedRetinaBackgroundProperty};
          }
        }
      `;

      return run(css, baseOptions).then(function({ output, warnings }) {
        expect(output.nodes.length).to.equal(2);

        const oldMediaQuery = output.nodes[1];

        expect(oldMediaQuery.type).to.equal('atrule');
        expect(oldMediaQuery.name).to.equal('media');

        const [ rule ] = oldMediaQuery.nodes;
        const [ decl ] = rule.nodes;

        expect(decl.value).to.equal(providedRetinaBackgroundProperty);

        expect(warnings).to.be.empty;
      });
    });

    it('issues a warning to the developer if a manually defined bg image matches the generated one', function() {
      const providedRetinaBackgroundProperty = "url('file-with-one-retina@2x.png')";
      const css = `
        a {
          background-image: url('file-with-one-retina.png');
        }

        @media ${DEFAULT_MEDIA_QUERY} {
          a {
            background-image: ${providedRetinaBackgroundProperty};
          }
        }
      `;

      return run(css, baseOptions).then(function({ output, warnings }) {
        expect(output.nodes.length).to.equal(2);

        const oldMediaQuery = output.nodes[1];

        expect(oldMediaQuery.type).to.equal('atrule');
        expect(oldMediaQuery.name).to.equal('media');

        const [ rule ] = oldMediaQuery.nodes;
        const [ decl ] = rule.nodes;

        expect(decl.value).to.equal(providedRetinaBackgroundProperty);

        const [ warning ] = warnings;

        expect(warnings.length).to.equal(1);
        expect(warning.line).to.equal(8);
        expect(warning.column).to.equal(13);
        expect(warning.text).to.equal('Unncessary retina image provided; the same will be generated automatically');
      });
    });

    it('does nothing with existing media queries that do not specify a background image', function() {
      const css = `
        a {
          background: red;
        }

        @media ${DEFAULT_MEDIA_QUERY} {
          a {
            background: blue;
          }
        }
      `;

      return run(css, baseOptions).then(function({ output, warnings }) {
        expect(output.nodes.length).to.equal(2);
        expect(warnings).to.be.empty;
      });
    });

    it('works with nested media queries', function() {
      const css = `
        @media (min-width: 600px) {
          a {
            background-image: url('file-with-one-retina.png');
          }
        }

        @media (-webkit-min-device-pixel-ratio: 2) and (min-width: 600px), (min-resolution: 192dpi) and (min-width: 600px) {
          a {
            background-image: url('file-with-one-retina@2x.png');
          }
        }
      `;

      return run(css, baseOptions).then(function({ output, warnings }) {
        expect(output.nodes.length).to.equal(2);

        output.nodes.forEach(function(mq) {
          expect(mq.type).to.equal('atrule');
          expect(mq.name).to.equal('media');
        });

        const [ firstRule, secondRule ] = output.nodes;

        expect(firstRule.params).to.equal('(min-width: 600px)');
        expect(secondRule.params).to.equal('(-webkit-min-device-pixel-ratio: 2) and (min-width: 600px), (min-resolution: 192dpi) and (min-width: 600px)');

        expect(warnings.length).to.equal(1);
      });
    });
  });

  describe('options', function() {
    it('can be given an retina suffix', function() {
      const css = `
        a {
          background: url('file-with-other-retina.png');
        }
      `;

      return run(css, {
        retinaSuffix: '_2x',
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: baseOptions.assetDirectory
      }).then(function({ output }) {
        const mq = output.nodes[1];
        const [ mqRule ] = mq.nodes;
        const [ decl ] = mqRule.nodes;

        expect(decl.value).to.equal("url('file-with-other-retina_2x.png')");
      });
    });

    it('can be given a media query to use', function() {
      const css = `
        a {
          background: url('file-with-one-retina.png');
        }
      `;

      return run(css, {
        retinaSuffix: '@2x',
        mediaQuery: 'foo',
        assetDirectory: baseOptions.assetDirectory
      }).then(function({ output }) {
        const mq = output.nodes[1];

        expect(mq.params).to.equal('foo');
      });
    });

    it('can be given includeFileExtensions', function() {
      const css = `
        a {
          background-image: url('file-with-svg-ext.svg');
        }
        div {
          background-image: url('file-with-one-retina.png');
        }
      `;

      return run(css, {
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: baseOptions.assetDirectory,
        includeFileExtensions: ['.svg', '.png']
      }).then(function({ output }) {
        const nodes = output.nodes;

        expect(nodes[0].nodes[0].value).to.equal("url('file-with-svg-ext.svg')");
        expect(nodes[1].nodes[0].nodes[0].value).to.equal("url('file-with-svg-ext@2x.svg')");
        expect(nodes[2].nodes[0].value).to.equal("url('file-with-one-retina.png')");
        expect(nodes[3].nodes[0].nodes[0].value).to.equal("url('file-with-one-retina@2x.png')");
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
            background-image: url('file-with-one-retina.png');
          }
        `;

        return run(css, {
          retinaSuffix: '@2x',
          assetDirectory: baseOptions.assetDirectory
        }).then(function({ output }) {
          const mq = output.nodes[1];
          const { params } = mq;

          expect(params).to.equal(DEFAULT_MEDIA_QUERY);
        });
      });

      it('uses `@2x` as the default retina suffix if none is provided', function() {
        const css = `
          a {
            background-image: url('file-with-one-retina.png');
          }
        `;

        return run(css, {
          mediaQuery: DEFAULT_MEDIA_QUERY,
          assetDirectory: baseOptions.assetDirectory
        }).then(function({ output }) {
          const mq = output.nodes[1];
          const [ mqRule ] = mq.nodes;
          const [ decl ] = mqRule.nodes;

          expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
        });
      });

      it('uses `.png, .jpg, .jpeg` as the default extensions if none is provided', function() {
        const css = `
          a {
            background-image: url('file-with-svg-ext.svg');
          }
          div {
            background-image: url('file-with-one-retina.png');
          }
        `;

        return run(css, {
          mediaQuery: DEFAULT_MEDIA_QUERY,
          assetDirectory: baseOptions.assetDirectory
        }).then(function({ output }) {
          const nodes = output.nodes;

          expect(nodes[0].nodes[0].value).to.equal("url('file-with-svg-ext.svg')");
          expect(nodes[1].nodes[0].value).to.equal("url('file-with-one-retina.png')");
          expect(nodes[2].nodes[0].nodes[0].value).to.equal("url('file-with-one-retina@2x.png')");
        });
      });
    });
  });
});
