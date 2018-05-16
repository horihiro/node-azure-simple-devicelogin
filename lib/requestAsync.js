const request = require('request');

module.exports = (url, params) => new Promise((resolve, reject) => {
  request(url, params, (err, header, body) => {
      if (err) {
          reject(err);
          return;
      }
      resolve({ header, body });
  });
});