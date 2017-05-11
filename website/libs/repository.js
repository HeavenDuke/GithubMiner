/**
 * Created by heavenduke on 17-5-9.
 */

var https = require('https');
var url = require('url');
var util = require('util');

var Repository = {};

Repository.getReadme = function (name, branch, callback) {
    var url = "https://raw.githubusercontent.com/" + name + "/" + (branch ? branch : "master") + "/README.md";
    var result = "";
    https.get(url, function (res) {
        if (res.statusCode == 404) {
            callback();
        }
        else {
            res.on('data', function (d) {
                result += d;
            });
            res.on('end', function () {
                callback(result);
            });
        }
    });
};

module.exports = Repository;