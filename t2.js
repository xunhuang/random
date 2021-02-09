"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require('cheerio');
var CloudDB = require("./CloudDB");
var Storage = CloudDB.getStorageRef();
var ref = Storage.child('abc/text.text');
/*
// Raw string is the default if no format is provided
var message = 'This is my message.';
ref.putString(message).then((snapshot) => {
    console.log('Uploaded a raw string!');
});
*/
/*
ref.getDownloadURL()
    .then((url) => {
        // Insert url into an <img> tag to "download"
        console.log(url);
    })
    .catch((error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
            case 'storage/object-not-found':
                // File doesn't exist
                break;
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
            case 'storage/canceled':
                // User canceled the upload
                break;
            case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                break;
        }
    });
    */
CloudDB.saveInfoAtSystem("helloworld", "I like this I like this.").then(function () {
    console.log("done");
});
//# sourceMappingURL=t2.js.map