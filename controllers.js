/**
 * Created by heavenduke on 17-2-14.
 */

var Octokat = require('octokat');
var libs = require('./libs');
var config = require('./config');
var Controllers = {};

/**
 *
 * @param req
 * @param res
 * @param next
 */
Controllers.page = function (req, res, next) {
    res.render("index");
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
Controllers.api = function (req, res, next) {
    var octo = new Octokat(config.basicUser);
    var repository_name = req.params.repository;
    var username = req.params.username;
    octo.repos(username, repository_name).fetch().then(function (repository) {
        libs.search(repository, function (err, list) {
            if (err) {
                return next(err);
            }
            else {
                return res.json({related_repo: list, message: "Hello World!"});
            }
        });
    });
};

module.exports = Controllers;