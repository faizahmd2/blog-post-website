const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const CleanCSS = require('clean-css');

const outputDirectory = path.resolve(__dirname, '../','public/build');

async function minifyAndCopy(directory) {
  try {
    const files = await fs.promises.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        await minifyAndCopy(filePath); // Recursively process subdirectories
      } else {
        const fileExtension = path.extname(filePath).toLowerCase();

        if (fileExtension === '.js') {
          await minifyAndCopyFileJs(directory, filePath, outputDirectory, Terser.minify);
        } else if (fileExtension === '.css') {
          await minifyAndCopyFileCss(directory, filePath, outputDirectory, async (code) => {
            const minified = new CleanCSS().minify(code);
            if (minified.errors.length) {
              throw new Error(minified.errors.join('\n'));
            }
            return minified.styles;
          });
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function minifyAndCopyFileJs(sourceDirectory, filePath, outputDirectory, minifyFunction) {
  try {
    const code = await fs.promises.readFile(filePath, 'utf8');
    const minifiedCode = await minifyFunction(code);

    const relativePath = path.relative(sourceDirectory, filePath);
    const outputFile = path.join(outputDirectory, relativePath);

    await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.promises.writeFile(outputFile, minifiedCode.code);
    console.log(`SUCCESS: "${filePath}"`);
  } catch (error) {
    console.error(`ERROR: "${filePath}":`, error);
  }
}

async function minifyAndCopyFileCss(sourceDirectory, filePath, outputDirectory, minifyFunction) {
  try {
    const code = await fs.promises.readFile(filePath, 'utf8');
    if (!code) {
      throw new Error(`EMPTY: "${filePath}"`);
    }

    const minifiedCode = await minifyFunction(code);

    const relativePath = path.relative(sourceDirectory, filePath);
    const outputFile = path.join(outputDirectory, relativePath);

    await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });
    await fs.promises.writeFile(outputFile, minifiedCode);
    console.log(`SUCCESS: "${filePath}"`);
  } catch (error) {
    console.error(`ERROR: "${filePath}"`, error);
  }
}

module.exports = minifyAndCopy;
