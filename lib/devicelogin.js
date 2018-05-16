const EventEmitter = require("events").EventEmitter;
const util = require("util");
const querystring = require('querystring');

const requestAsync = require('./requestAsync');
const loop = require('./while');

const DeviceLogin = function () {

};

util.inherits(DeviceLogin, EventEmitter);

DeviceLogin.prototype.login = function (params) {
  const resource = params.resource;
  const clientId = params.clientId;
  const interval = params.tickInterval || 5000;
  const loginUrl = `https://login.microsoftonline.com/common/oauth2/devicecode?resource=${encodeURIComponent(resource)}&client_id=${clientId}&expire_in=10`
  const checkUrl = `https://login.microsoftonline.com/common/oauth2/token`;

  requestAsync(loginUrl)
    .then(response => JSON.parse(response.body))
    .then((body) => {
      if (body.error) return Promise.reject(body);

      process.nextTick(() => {
        this.emit('accepted', body);
      });
      const expiresIn = parseFloat(body.expires_in) * 1000;
      const startTime = Date.now();

      const authForm = querystring.stringify({
        grant_type: 'device_code',
        resource: resource,
        client_id: clientId,
        code: body.device_code
      });
      const loginCheck = (res) => new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, interval);
      })
        .then(() => requestAsync({
            url: checkUrl,
            method: 'POST',
            headers: {
              'Content-Length': authForm.length,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: authForm,
          })
        )
        .then((res) => {
          const body = JSON.parse(res.body);
          // if (startTime + expiresIn < Date.now()) body.error = 'code_expired';
          const error = body.error;
          if (error === 'authorization_pending') process.nextTick(() => {
            body.expires_in = String(((startTime + expiresIn) - Date.now()) / 1000).replace(/\..*$/, '');
            body.state = body.error;
            body.description = body.error_description;
            delete body.error;
            delete body.error_description;
            delete body.error_codes
            this.emit('tick', body);
          });
          return {
            done: !error || (error && error !== 'authorization_pending'),
            value: body
          }
        });
      return loop(Promise.resolve({ error: "authorization_pending" }), loginCheck);
    })
    .then((res) => {
      if (res.error) return Promise.reject(res);

      process.nextTick(() => {
        this.emit('authorized', res);
      });
    })
    .catch((error) => {
      process.nextTick(() => {
        this.emit('error', error);
      });
    });
};

module.exports = DeviceLogin;