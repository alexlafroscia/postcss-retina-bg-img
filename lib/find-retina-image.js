import { basename, dirname, extname, join } from 'path';
import { accessSync } from 'fs';

function fileExists(file) {
  try {
    accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
}

export default function findRetinaImage(filePath, options = {}) {
  let retinaSuffixes = options.retinaSuffix;

  if (typeof retinaSuffixes === 'undefined') {
    retinaSuffixes = ['@2x'];
  } else if (typeof retinaSuffixes === 'string') {
    retinaSuffixes = [retinaSuffixes];
  }

  const fileDirectory = dirname(filePath);
  const fileExtension = extname(filePath);
  const fileName = basename(filePath, fileExtension);

  return retinaSuffixes
    .map((suffix) => join(fileDirectory, fileName + suffix + fileExtension))
    .find((retinaFileName) => fileExists(retinaFileName));
}
