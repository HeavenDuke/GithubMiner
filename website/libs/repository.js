/**
 * Created by heavenduke on 17-5-9.
 */

var https = require('https');
var url = require('url');
var util = require('util');

var Repository = {};

Repository.getReadme = function (name, callback) {
    var url = "https://raw.githubusercontent.com/" + name + "/master/README.md";
    var result = "";
    https.get(url, function (res) {
        res.on('data', function (d) {
            result += d;
        });
        res.on('end', function () {
            callback(result);
        });
    });
};

module.exports = Repository;