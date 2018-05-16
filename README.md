# node-azure-simple-devicelogin

Utility for azure device login.

## Install

```sh
npm i azure-simple-devicelogin
``` 

## Usage

```js
const DeviceLogin = require('azure-simple-devicelogin');
const params = require('./params.json');

console.log(JSON.stringify(params, null, 2));
/*
{
  "clientId": "1a8b52ed-...",                // required
  "resource": "https://graph.microsoft.com", // required
  "tickInterval": 2000                       // optional, default is 5000
}
 */
const deviceLogin = new DeviceLogin();

deviceLogin.on('error', (error) => {
  console.error(error);
  process.exit(1);
});

deviceLogin.on('accepted', (data) => {
  // emitted on accepted clientId and resource
  console.log(JSON.stringify(data, null, 2));
  /*
  {
    user_code: 'XXXXXXXXXX',
    device_code: 'GAQABAAEAAA...',
    verification_url: 'https://...',
    expires_in: '900',
    interval: '5',
    message: 'To sign in, use a web browser to open ...'
  }
  */
});

deviceLogin.on('tick', (data) => {
  // emitted in each time specified by `tickInterval` parameter
  console.log(JSON.stringify(data, null, 2));
  /* 
  {
    "timestamp": "YYYY-MM-DD hh:mm:ssZ",
    "trace_id": "eefc4e91-...",
    "correlation_id": "9c531f07-b11f-495c-8b8c-abfc042a2ed...e",
    "expires_in": "894",
    "state": "authorization_pending",
    "description": "..."
  }
  */
});

deviceLogin.on('authorized', (data) => {
  // emitted on authorized device code 
  console.log(JSON.stringify(data, null, 2));
  /* 
  {
    token_type: 'Bearer',
    scope: '<scope>',
    expires_in: '3599',
    ext_expires_in: '0',
    expires_on: 'xxxxxxxxxx',
    not_before: 'xxxxxxxxxx',
    resource: 'https://..',
    access_token: 'eyJ0eXAi...',
    refresh_token: 'AQABAAA...',
    id_token: 'eyJ0eXAi...'
  }
  */
});

deviceLogin.login(params);
```