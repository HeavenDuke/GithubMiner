/**
 * Created by heavenduke on 17-4-28.
 */

exports.home = function (req, res, next) {
    res.render("index", {
        title: "GithubMiner"
    });
};

exports.users = require('./users');

exports.search = require('./search');

exports.ranking = require('./ranking');

exports.repositories = require('./repository');

exports.api = require('./api');