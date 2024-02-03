// logEvents.js

const fs = require('fs');

const logEvents = (message, filename) => {
  // Append the log message to the specified file
  fs.appendFileSync(filename, `${new Date().toISOString()}: ${message}\n`);
};

module.exports = { logEvents };
