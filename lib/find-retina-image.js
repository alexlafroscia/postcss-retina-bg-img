import { basename, dirname, extname, join } from 'path';
import { statSync } from 'fs';

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
    .find(function(retinaFileName) {
      try {
        if (statSync(retinaFileName).isFile()) {
          return retinaFileName;
        }
      } catch (e) {
        // Ignore "file not found" errors
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
    });
}
