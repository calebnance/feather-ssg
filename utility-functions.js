'use strict';

const path = require('path');

// grab the configuration file
const siteConfig = require('./site-config.json');

/******************************************************************************\
 * utility functions
\******************************************************************************/

// stretch line in cli to the end
function lineStretchToEnd(msg, lineSep) {
  const spaceNeeded = lineSep.length - msg.length;
  let spacer = '';

  // if space is needed in message
  if (spaceNeeded > 0) {
    const spaceArray = Array.from(Array(spaceNeeded).keys());
    spacer = spaceArray.map(item => ' ').join('');
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

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
  const subDirPath = pathArr[0] === undefined ? '' : `${pathArr[0]}/`;
  const subPath = `/${subDirPath}${fileName}`;

  return {
    fileExt,
    fileName,
    fullPath: `${siteConfig.baseUrl}${subPath}.html`,
    subPath
  };
}

module.exports = { lineStretchToEnd, formatBytes, parseFilePath };
