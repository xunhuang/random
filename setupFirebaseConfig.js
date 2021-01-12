// 
// before running me you should do a "npm install firebase-tools" in current directory
//
const fbcli = require('firebase-tools');
const fs = require('fs');

fbcli.apps.sdkconfig().then(config => {
  const contentPretty = JSON.stringify(config.sdkConfig, null, 2);
  console.log(contentPretty);
});
