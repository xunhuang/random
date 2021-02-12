const cheerio = require('cheerio');
import * as CloudDB from './CloudDB';

const Storage = CloudDB.getStorageRef();
var ref = Storage.child('abc/text.text');
const fetch = require("node-fetch");
