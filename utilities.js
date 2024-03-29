const fs = require('fs');
const path = require('path');

// grab the configuration file
const siteConfig = require('./site-config.json');

/** ***************************************************************************\
 * utility functions
\**************************************************************************** */

// stretch line in cli to the end
function lineStretchToEnd(msg, lineSep) {
  const spaceNeeded = lineSep.length - msg.length;
  let spacer = '';

  // if space is needed in message
  if (spaceNeeded > 0) {
    const spaceArray = Array.from(Array(spaceNeeded).keys());
    spacer = spaceArray.map(() => ' ').join('');
  }

  return `${msg}${spacer}`;
}

// format bytes to better display sizing
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

// parse file path and create helpful file info object
function parseFilePath(filePath) {
  const fileExt = path.extname(filePath);
  const fileName = path.basename(filePath, fileExt);
  const pathNoExt = path.dirname(filePath);

  const pathArrBase = pathNoExt.split('/src/html/');
  pathArrBase.shift();

  const pathArr = pathArrBase[0].split('/');
  pathArr.shift();

  const pathDepth = pathArr.join('/');
  const subDirPath = pathArr[0] === undefined ? '' : `${pathDepth}/`;
  const subPath = `/${subDirPath}${fileName}`;

  return {
    fileExt,
    fileName,
    fullPath: `${siteConfig.baseUrl}${subPath}.html`,
    subPath
  };
}

// create sitemap
// reference: https://www.sitemaps.org/protocol.html
function createSitemap(pages) {
  let urls = '';
  Object.keys(pages).forEach((url, index) => {
    const isLast = index + 1 === pages.length;
    const endOfLine = isLast ? '' : '\r\n';
    urls += `  <url>\r\n    <loc>${siteConfig.baseUrl}${url}.html</loc>\r\n  </url>${endOfLine}`;
  });
  const siteMapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  fs.writeFileSync('static_prod/sitemap.xml', siteMapContent);
}

module.exports = {
  createSitemap,
  formatBytes,
  lineStretchToEnd,
  parseFilePath
};
