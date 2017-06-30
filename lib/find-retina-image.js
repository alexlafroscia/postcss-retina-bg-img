const { extname, join } = require('path');
const { accessSync } = require('fs');

function fileExists(file) {
  try {
    accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
}

function findRetinaImage(filePath, assetDirectory, retinaSuffixes = ['@2x']) {
  if (typeof retinaSuffixes === 'string') {
    retinaSuffixes = [retinaSuffixes];
  }

  const fileExtension = extname(filePath);

  return retinaSuffixes
    .map(
      suffix =>
        filePath.substr(0, filePath.length - fileExtension.length) +
        suffix +
        fileExtension
    )
    .find(retinaFileName => fileExists(join(assetDirectory, retinaFileName)));
}

module.exports = findRetinaImage;
