import { join, resolve } from 'path';

import postcss from 'postcss';

import findRetinaImage from './find-retina-image';

export const DEFAULT_MEDIA_QUERY = '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)';
const DEFAULT_RETINA_SUFFIX = '@2x';
const URL_EXTRACT_REGEX = new RegExp(/url\((?:'|")(.*)(?:'|")\)/);

function createMediaQuery(query) {
  return postcss.atRule({ name: 'media', params: query });
}

function getProjectRoot() {
  // TODO: This needs to work for real
  return resolve(__dirname, '../tests');
}

function retinaBackgroundImage(options = {}) {
  return function(root) {
    const retinaSuffix = options.retinaSuffix || DEFAULT_RETINA_SUFFIX;
    const mediaQuery = options.mediaQuery || DEFAULT_MEDIA_QUERY;
    const projectRoot = options.projectRoot || getProjectRoot();
    let assetDirectory = options.assetDirectory;

    if (!assetDirectory) {
      throw new Error('You must provide an asset directory');
    }

    assetDirectory = resolve(projectRoot, assetDirectory);

    root.walkRules(function(rule) {
      rule.walkDecls(/^background/, function(decl) {
        const { value } = decl;
        const backgroundPropertyPath = URL_EXTRACT_REGEX.exec(value);

        // Abort if we couldn't parse the image URL from the property
        if (!(backgroundPropertyPath && backgroundPropertyPath[1])) {
          return;
        }

        const relativeImagePath = backgroundPropertyPath[1];
        const absoluteImagePath = join(assetDirectory, relativeImagePath);
        const retinaImagePath = findRetinaImage(absoluteImagePath, { retinaSuffix });

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

        // Create the rule to attach it to
        const ruleInMediaQuery = postcss.rule({ selector: rule.selector });
        ruleInMediaQuery.append(retinaImageDecl);

        // Create the media query
        const mq = createMediaQuery(mediaQuery);
        mq.append(ruleInMediaQuery);

        // Insert the media query after the rule in the root
        root.insertAfter(rule, mq);
      });
    });
  };
}

module.exports = postcss.plugin('postcss-retina-bg-img', retinaBackgroundImage);
