const { describe, it } = require('mocha');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { baseOptions, run } = require('./helpers');

const { expect } = chai;

const postcss = require('postcss');
const bgImage = require('../lib/postcss-plugin.js');
const { DEFAULT_MEDIA_QUERY } = bgImage;

chai.use(chaiAsPromised);

describe('PostCSS Plugin', function() {
  it('does not add the media query if the retina image is not found', async function() {
    const css = `
      a {
        background-image: url('file-without-retina.png');
      }
    `;

    const { output, warnings } = await run(css, baseOptions);
    expect(output.nodes.length).to.equal(1);
    expect(output.nodes[0].type).to.equal('rule');

    expect(warnings.length).to.equal(1);

    const [warning] = warnings;

    expect(warning.line).to.equal(3);
    expect(warning.column).to.equal(9);
    expect(warning.text).to.equal(
      'Could not find retina version for `file-without-retina.png`'
    );
  });

  it('does not display a warning if warnings are turned off via the options if the retina image is not found', async function() {
    const css = `
      a {
        background-image: url('file-without-retina.png');
      }
    `;

    const { output, warnings } = await run(
      css,
      Object.assign({}, baseOptions, { logMissingImages: false })
    );

    expect(output.nodes.length).to.equal(1);
    expect(output.nodes[0].type).to.equal('rule');

    expect(warnings.length).to.equal(0);
  });

  it('merges media queries', async function() {
    const css = `
      @media (min-width: 600px) {
        a {
          background-image: url('file-with-one-retina.png');
        }
      }
    `;

    const { output } = await run(css, baseOptions);
    const [originalMqRule, newMqRule] = output.nodes;

    expect(originalMqRule.params).to.equal('(min-width: 600px)');
    expect(newMqRule.params).to.equal(
      '(-webkit-min-device-pixel-ratio: 2) and (min-width: 600px), (min-resolution: 192dpi) and (min-width: 600px)'
    );

    expect(originalMqRule.nodes[0].nodes[0].value).to.equal(
      "url('file-with-one-retina.png')"
    );
    expect(newMqRule.nodes[0].nodes[0].value).to.equal(
      "url('file-with-one-retina@2x.png')"
    );

    output.nodes.forEach(function(mq) {
      expect(mq.type).to.equal('atrule');
      expect(mq.name).to.equal('media');
      expect(mq.nodes.length).to.equal(1);

      const [firstRule] = mq.nodes;
      expect(firstRule.selector).to.equal('a');

      const [decl] = firstRule.nodes;
      expect(decl.prop).to.equal('background-image');
    });
  });

  describe('handling different types of background images', function() {
    it('maintains absolute URL paths to images', async function() {
      const css = `
        a {
          background-image: url('/file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, baseOptions);
      const [, mq] = output.nodes;
      const [retinaRule] = mq.nodes;
      const [bgDecl] = retinaRule.nodes;

      expect(bgDecl.value).to.equal("url('/file-with-one-retina@2x.png')");
    });

    it('ignores full URL paths to images', async function() {
      const css = `
        a {
          background-image: url('http://foo.com/bar.jpg');
        }

        b {
          background-iamge: url('https://foo.com/bar.jpg');
        }
      `;

      const { output } = await run(css, baseOptions);
      expect(output.nodes.length).to.equal(2);
    });

    it('finds images with relative paths', async function() {
      const css = `
        a {
          background-image: url('./fixtures/file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, {});
      const [, mq] = output.nodes;
      const [retinaRule] = mq.nodes;
      const [bgDecl] = retinaRule.nodes;

      expect(bgDecl.value).to.equal(
        "url('./fixtures/file-with-one-retina@2x.png')"
      );
    });

    it('finds multiple images when provided', async function() {
      const css = `
        a {
          background-image: url('./fixtures/file-with-one-retina.png'), url(./fixtures/file-with-one-retina-2.png);
        }
      `;

      const { output } = await run(css, {});
      const [, mq] = output.nodes;
      const [retinaRule] = mq.nodes;
      const [bgDecl] = retinaRule.nodes;

      expect(bgDecl.value).to.equal(
        "url('./fixtures/file-with-one-retina@2x.png'), url('./fixtures/file-with-one-retina-2@2x.png')"
      );
    });

    it('includes original image with no retine alternative when multiple images are provided', async function() {
      const css = `
        a {
          background-image: url('./fixtures/file-with-one-retina.png'), url(./fixtures/file-without-retina.png);
        }
      `;

      const { output } = await run(css, {});
      const [, mq] = output.nodes;
      const [retinaRule] = mq.nodes;
      const [bgDecl] = retinaRule.nodes;

      expect(bgDecl.value).to.equal(
        "url('./fixtures/file-with-one-retina@2x.png'), url('./fixtures/file-without-retina.png')"
      );
    });
  });

  describe('`background-image` property', function() {
    it('adds the retina version of the provided image', async function() {
      const css = `
        a {
          background-image: url('file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, baseOptions);
      const mq = output.nodes[1];
      expect(mq.type).to.equal('atrule');
      expect(mq.name).to.equal('media');

      const [mqRule] = mq.nodes;
      expect(mqRule.selector).to.equal('a');

      const [decl] = mqRule.nodes;
      expect(decl.prop).to.equal('background-image');
      expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
    });
  });

  describe('`background` property', function() {
    it('adds the retina version of the provided image', async function() {
      const css = `
        a {
          background: url('file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, baseOptions);
      const mq = output.nodes[1];
      expect(mq.type).to.equal('atrule');
      expect(mq.name).to.equal('media');

      const [mqRule] = mq.nodes;
      expect(mqRule.selector).to.equal('a');

      const [decl] = mqRule.nodes;
      expect(decl.prop).to.equal('background-image');
      expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
    });

    it('does not add anything if an image is not present', async function() {
      const css = `
        a {
          background: red;
        }
      `;

      const { output } = await run(css, baseOptions);
      expect(output.nodes.length).to.equal(1);

      const [rule] = output.nodes;
      const [decl] = rule.nodes;

      expect(decl.value).to.equal('red');
    });

    it('adds the retina image even if the property contains additional information', async function() {
      const css = `
        a {
          background: url('file-with-one-retina.png') no-repeat center center;
        }
      `;

      const { output } = await run(css, baseOptions);
      const mq = output.nodes[1];
      expect(mq.type).to.equal('atrule');
      expect(mq.name).to.equal('media');

      const [mqRule] = mq.nodes;
      expect(mqRule.selector).to.equal('a');

      const [decl] = mqRule.nodes;
      expect(decl.prop).to.equal('background-image');
      expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
    });
  });

  describe('`list-style-image` property', function() {
    it('adds the retina version of the provided image', async function() {
      const css = `
        li {
          list-style-image: url('file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, baseOptions);
      const [, mq] = output.nodes;
      const [mqRule] = mq.nodes;
      const [decl] = mqRule.nodes;

      expect(output.nodes.length).to.equal(2);
      expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
    });
  });

  describe('avoiding existing retina images', function() {
    it('does not add a retina rule of one already exists for the selector', async function() {
      const providedRetinaBackgroundProperty =
        "url('some-other-retina-image.png')";
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

      const { output, warnings } = await run(css, baseOptions);
      expect(output.nodes.length).to.equal(2);

      const oldMediaQuery = output.nodes[1];

      expect(oldMediaQuery.type).to.equal('atrule');
      expect(oldMediaQuery.name).to.equal('media');

      const [rule] = oldMediaQuery.nodes;
      const [decl] = rule.nodes;

      expect(decl.value).to.equal(providedRetinaBackgroundProperty);
      expect(warnings).to.be.empty;
    });

    it('issues a warning to the developer if a manually defined bg image matches the generated one', async function() {
      const providedRetinaBackgroundProperty =
        "url('file-with-one-retina@2x.png')";
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

      const { output, warnings } = await run(css, baseOptions);
      expect(output.nodes.length).to.equal(2);

      const oldMediaQuery = output.nodes[1];

      expect(oldMediaQuery.type).to.equal('atrule');
      expect(oldMediaQuery.name).to.equal('media');

      const [rule] = oldMediaQuery.nodes;
      const [decl] = rule.nodes;

      expect(decl.value).to.equal(providedRetinaBackgroundProperty);

      const [warning] = warnings;

      expect(warnings.length).to.equal(1);
      expect(warning.line).to.equal(8);
      expect(warning.column).to.equal(13);
      expect(warning.text).to.equal(
        'Unncessary retina image provided; the same will be generated automatically'
      );
    });

    it('does nothing with existing media queries that do not specify a background image', async function() {
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

      const { output, warnings } = await run(css, baseOptions);

      expect(output.nodes.length).to.equal(2);
      expect(warnings).to.be.empty;
    });

    it('works with nested media queries', async function() {
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

      const { output, warnings } = await run(css, baseOptions);
      expect(output.nodes.length).to.equal(2);

      output.nodes.forEach(function(mq) {
        expect(mq.type).to.equal('atrule');
        expect(mq.name).to.equal('media');
      });

      const [firstRule, secondRule] = output.nodes;

      expect(firstRule.params).to.equal('(min-width: 600px)');
      expect(secondRule.params).to.equal(
        '(-webkit-min-device-pixel-ratio: 2) and (min-width: 600px), (min-resolution: 192dpi) and (min-width: 600px)'
      );

      expect(warnings.length).to.equal(1);
    });
  });

  describe('options', function() {
    it('can be given an retina suffix', async function() {
      const css = `
        a {
          background: url('file-with-other-retina.png');
        }
      `;

      const { output } = await run(css, {
        retinaSuffix: '_2x',
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: baseOptions.assetDirectory
      });
      const mq = output.nodes[1];
      const [mqRule] = mq.nodes;
      const [decl] = mqRule.nodes;

      expect(decl.value).to.equal("url('file-with-other-retina_2x.png')");
    });

    it('can be given a media query to use', async function() {
      const css = `
        a {
          background: url('file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, {
        retinaSuffix: '@2x',
        mediaQuery: 'foo',
        assetDirectory: baseOptions.assetDirectory
      });
      const mq = output.nodes[1];

      expect(mq.params).to.equal('foo');
    });

    it('can be given includeFileExtensions', async function() {
      const css = `
        a {
          background-image: url('file-with-svg-ext.svg');
        }
        div {
          background-image: url('file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, {
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: baseOptions.assetDirectory,
        includeFileExtensions: ['.svg', '.png']
      });
      const nodes = output.nodes;

      expect(nodes[0].nodes[0].value).to.equal("url('file-with-svg-ext.svg')");
      expect(nodes[1].nodes[0].nodes[0].value).to.equal(
        "url('file-with-svg-ext@2x.svg')"
      );
      expect(nodes[2].nodes[0].value).to.equal(
        "url('file-with-one-retina.png')"
      );
      expect(nodes[3].nodes[0].nodes[0].value).to.equal(
        "url('file-with-one-retina@2x.png')"
      );
    });

    describe('default options', function() {
      it('errors if an asset directory is not specified', function() {
        const processCSS = postcss([bgImage({})]).process('a {}');

        return expect(processCSS).to.be.rejectedWith(
          'You must provide an asset directory'
        );
      });

      it('uses the "CSS-Tricks" recommended media query if none is provided', async function() {
        const css = `
          a {
            background-image: url('file-with-one-retina.png');
          }
        `;

        const { output } = await run(css, {
          retinaSuffix: '@2x',
          assetDirectory: baseOptions.assetDirectory
        });
        const mq = output.nodes[1];
        const { params } = mq;

        expect(params).to.equal(DEFAULT_MEDIA_QUERY);
      });

      it('uses `@2x` as the default retina suffix if none is provided', async function() {
        const css = `
          a {
            background-image: url('file-with-one-retina.png');
          }
        `;

        const { output } = await run(css, {
          mediaQuery: DEFAULT_MEDIA_QUERY,
          assetDirectory: baseOptions.assetDirectory
        });
        const mq = output.nodes[1];
        const [mqRule] = mq.nodes;
        const [decl] = mqRule.nodes;

        expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
      });

      it('uses `.png, .jpg, .jpeg` as the default extensions if none is provided', async function() {
        const css = `
          a {
            background-image: url('file-with-svg-ext.svg');
          }
          div {
            background-image: url('file-with-one-retina.png');
          }
        `;

        const { output } = await run(css, {
          mediaQuery: DEFAULT_MEDIA_QUERY,
          assetDirectory: baseOptions.assetDirectory
        });
        const nodes = output.nodes;

        expect(nodes[0].nodes[0].value).to.equal(
          "url('file-with-svg-ext.svg')"
        );
        expect(nodes[1].nodes[0].value).to.equal(
          "url('file-with-one-retina.png')"
        );
        expect(nodes[2].nodes[0].nodes[0].value).to.equal(
          "url('file-with-one-retina@2x.png')"
        );
      });
    });
  });

  describe('handling quotes URLs', function() {
    it('works with single quotes', async function() {
      const css = `
        a {
          background-image: url('file-with-one-retina.png');
        }
      `;

      const { output } = await run(css, {
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: baseOptions.assetDirectory
      });
      const mq = output.nodes[1];
      const [mqRule] = mq.nodes;
      const [decl] = mqRule.nodes;

      expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
    });

    it('works with double quotes', async function() {
      const css = `
        a {
          background-image: url("file-with-one-retina.png");
        }
      `;

      const { output } = await run(css, {
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: baseOptions.assetDirectory
      });
      const mq = output.nodes[1];
      const [mqRule] = mq.nodes;
      const [decl] = mqRule.nodes;

      expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
    });

    it('works with no quotes', async function() {
      const css = `
        a {
          background-image: url(file-with-one-retina.png);
        }
      `;

      const { output } = await run(css, {
        mediaQuery: DEFAULT_MEDIA_QUERY,
        assetDirectory: baseOptions.assetDirectory
      });
      const mq = output.nodes[1];
      const [mqRule] = mq.nodes;
      const [decl] = mqRule.nodes;

      expect(decl.value).to.equal("url('file-with-one-retina@2x.png')");
    });
  });
});
