import { join } from 'path';
import postcss from 'postcss';

import findRetinaImage from './find-retina-image';
import { distributeQueryAcrossQuery, queryCoversRange, nodeIsMediaQuery } from './utils/media-query';
import { isFullUrlPath, isAbsoluteFilePath, makeAbsoluteFilePath } from './utils/image-url';

const UNNECESSARY_RETINA_IMAGE_WARNING = 'Unncessary retina image provided; the same will be generated automatically';
const DEFAULT_MEDIA_QUERY = '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)';
const DEFAULT_RETINA_SUFFIX = '@2x';
const IMAGE_PROPERTY_REGEX = new RegExp(/^(background(-image))|(list-style-image)?$/);
const URL_EXTRACT_REGEX = new RegExp(/url\((?:'|")(.*)(?:'|")\)/);
const PROPERTY_TRANSLATIONS = {
  'background': 'background-image',
  'background-image': 'background-image',
  'list-style-image': 'list-style-image'
};

function backgroundImagePath(decl) {
  const { value } = decl;
  const backgroundPropertyPath = URL_EXTRACT_REGEX.exec(value);

  return backgroundPropertyPath && backgroundPropertyPath[1];
}

function missingRetinaImageWarning(image) {
  return `Could not find retina verion for \`${image}\``;
}

function retinaBackgroundImage(options) {
  return function(root, result) {
    const retinaSuffix = options.retinaSuffix || DEFAULT_RETINA_SUFFIX;
    const mediaQueryOption = options.mediaQuery || DEFAULT_MEDIA_QUERY;
    const assetDirectory = options.assetDirectory;
    const ruleBlacklist = {};
    let newMediaQueries = [];

    if (!assetDirectory) {
      throw new Error('You must provide an asset directory');
    }

    root.walkAtRules('media', function(atRule) {
      const { params } = atRule;

      if (!queryCoversRange(mediaQueryOption, params)) {
        return;
      }

      atRule.walkRules(function(rule) {
        const { selector } = rule;

        rule.walkDecls(IMAGE_PROPERTY_REGEX, function(decl) {
          const imgPath = backgroundImagePath(decl);

          if (imgPath) {
            ruleBlacklist[params] = ruleBlacklist[params] || {};
            ruleBlacklist[params][selector] = { imgPath, decl };
          }
        });
      });
    });

    root.walkRules(function(rule) {
      const { selector } = rule;
      const { parent: parentRule } = rule;
      let mediaQuery = mediaQueryOption;

      // The rule to add the new media query after
      let anchor = rule;

      // If the rule is inside a media query...
      if (parentRule && nodeIsMediaQuery(parentRule)) {
        // Short-circuit if the rule is already inside a retina media query
        if (queryCoversRange(mediaQueryOption, parentRule.params)) {
          return;
        }

        // Add the new media query after the parent one
        anchor = parentRule;
        mediaQuery = distributeQueryAcrossQuery(mediaQuery, parentRule.params);
      }

      // Create the media query and rule that we'll attach declarations to
      const mq = postcss.atRule({ name: 'media', params: mediaQuery });
      const ruleInMediaQuery = postcss.rule({ selector: rule.selector });
      mq.append(ruleInMediaQuery);

      rule.walkDecls(IMAGE_PROPERTY_REGEX, function(decl) {
        const { prop, value } = decl;

        const backgroundPropertyPath = URL_EXTRACT_REGEX.exec(value);

        // Abort if we couldn't parse the image URL from the property
        if (!(backgroundPropertyPath && backgroundPropertyPath[1])) {
          return;
        }

        const relativeImagePath = backgroundPropertyPath[1];

        // Short-circuit if the image path goes to a full URL that we can't check
        if (isFullUrlPath(relativeImagePath)) {
          return;
        }

        const absoluteImagePath = join(assetDirectory, relativeImagePath);
        const retinaImagePath = findRetinaImage(absoluteImagePath, retinaSuffix);

        // Abort if we couldn't find the retina version of the image
        if (!retinaImagePath) {
          decl.warn(result, missingRetinaImageWarning(relativeImagePath));
          return;
        }

        let relativeRetinaPath = retinaImagePath.replace(assetDirectory, '').substring(1);

        // Prune out instances where the rule has been defined explicitly; no need to generate a new media query
        if (ruleBlacklist[mediaQuery] && ruleBlacklist[mediaQuery][selector]) {
          const { imgPath, decl: existingDecl } = ruleBlacklist[mediaQuery][selector];

          if (imgPath === relativeRetinaPath) {
            existingDecl.warn(result, UNNECESSARY_RETINA_IMAGE_WARNING);
          }

          return;
        }

        if (isAbsoluteFilePath(relativeImagePath)) {
          relativeRetinaPath = makeAbsoluteFilePath(relativeRetinaPath);
        }

        // Create the new property
        const retinaImageDecl = postcss.decl({
          prop: PROPERTY_TRANSLATIONS[prop],
          value: `url('${relativeRetinaPath}');`
        });

        ruleInMediaQuery.append(retinaImageDecl);
      });

      // Only add the media query to the page if there are declarations in it
      if (ruleInMediaQuery.nodes.length > 0) {
        newMediaQueries.push({ anchor, mq });
      }
    });

    // Insert the media query after the rule in the root
    newMediaQueries.forEach(function({ anchor, mq }) {
      root.insertAfter(anchor, mq);
    });
  };
}

module.exports = postcss.plugin('postcss-retina-bg-img', retinaBackgroundImage);
module.exports.DEFAULT_MEDIA_QUERY = DEFAULT_MEDIA_QUERY;
