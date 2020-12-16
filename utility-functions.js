'use strict';

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

module.exports = { lineStretchToEnd, formatBytes };
