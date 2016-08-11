import { join } from 'path';
import postcss from 'postcss';
import findRetinaImage from './find-retina-image';

const DEFAULT_MEDIA_QUERY = '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)';
const DEFAULT_RETINA_SUFFIX = '@2x';
const URL_EXTRACT_REGEX = new RegExp(/url\((?:'|")(.*)(?:'|")\)/);

function combineMediaQueries(retinaQuery, parentQuery) {
  return retinaQuery
    .split(', ')
    .map((segment) => `${segment} and ${parentQuery}`)
    .join(', ');
}

function nodeIsMediaQuery(node) {
  return node.type === 'atrule' && node.name === 'media';
}

function retinaBackgroundImage(options) {
  return function(root) {
    const retinaSuffix = options.retinaSuffix || DEFAULT_RETINA_SUFFIX;
    const mediaQueryOption = options.mediaQuery || DEFAULT_MEDIA_QUERY;
    const assetDirectory = options.assetDirectory;
    let newMediaQueries = [];

    if (!assetDirectory) {
      throw new Error('You must provide an asset directory');
    }

    root.walkRules(function(rule) {
      const parentRule = rule.parent;
      let mediaQuery = mediaQueryOption;

      // The rule to add the new media query after
      let anchor = rule;

      // If the rule is inside a media query, we want to add the new rule after that
      if (parentRule && nodeIsMediaQuery(parentRule)) {
        anchor = parentRule;
        mediaQuery = combineMediaQueries(mediaQuery, parentRule.params);
      }

      // Create the media query and rule that we'll attach declarations to
      const mq = postcss.atRule({ name: 'media', params: mediaQuery });
      const ruleInMediaQuery = postcss.rule({ selector: rule.selector });
      mq.append(ruleInMediaQuery);

      rule.walkDecls(/^background(-image)?$/, function(decl) {
        const { value } = decl;
        const backgroundPropertyPath = URL_EXTRACT_REGEX.exec(value);

        // Abort if we couldn't parse the image URL from the property
        if (!(backgroundPropertyPath && backgroundPropertyPath[1])) {
          return;
        }

        const relativeImagePath = backgroundPropertyPath[1];
        const absoluteImagePath = join(assetDirectory, relativeImagePath);
        const retinaImagePath = findRetinaImage(absoluteImagePath, retinaSuffix);

        // Abort if we couldn't find the retina version of the image
        if (!retinaImagePath) {
          return;
        }

        const relativeRetinaPath = retinaImagePath.replace(assetDirectory, '').substring(1);

        // Create the new property
        const retinaImageDecl = postcss.decl({
          prop: 'background-image',
          value: `url('${relativeRetinaPath}');`
        });

        ruleInMediaQuery.append(retinaImageDecl);
      });

      // Only add the media query to the page if there are declarations in it
      if (ruleInMediaQuery.nodes.length > 0) {
        newMediaQueries.push([anchor, mq]);
      }
    });

    // Insert the media query after the rule in the root
    newMediaQueries.forEach(function([anchor, mq]) {
      root.insertAfter(anchor, mq);
    });
  };
}

module.exports = postcss.plugin('postcss-retina-bg-img', retinaBackgroundImage);
module.exports.DEFAULT_MEDIA_QUERY = DEFAULT_MEDIA_QUERY;
