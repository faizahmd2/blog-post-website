const fs = require('fs');
const path = require('path');

function extractBuildScripts(sourceDir, destinationDir) {
  fs.readdirSync(sourceDir).forEach((file) => {
    const filePath = path.join(sourceDir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      extractBuildScripts(filePath, path.join(destinationDir, file));
    } else if (filePath.endsWith('.ejs')) {
      const scriptContent = getBuildScriptInfo(filePath);
      
      if (scriptContent && scriptContent.length) {
        console.log("filename:",scriptContent[0].name+".js");
        const destinationFilePath = path.join(destinationDir, scriptContent[0].name + ".js");
        fs.writeFileSync(destinationFilePath, scriptContent[0].content, 'utf8');
      }
    }
  });
}

function getBuildScriptInfo(ejsFilePath) {
  const fileContent = fs.readFileSync(ejsFilePath, 'utf8');

  const scriptRegex = /<script\b[^>]*?build\s*=\s*(['"])(.*?)\1[^>]*>([\s\S]*?)<\/script>/gm;
  let matches = [];
  let match;
  while ((match = scriptRegex.exec(fileContent)) !== null) {
    matches.push({
      name: match[2],
      content: match[3].trim()
    });
  }

  if (matches.length === 0) {
    return null;
  }

  return matches;
}

module.exports = extractBuildScripts;
