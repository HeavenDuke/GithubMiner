/**
 * Created by heavenduke on 17-5-17.
 */

var Repository = require('../../../libs').repository;
var Github = require('github');

exports.create = function (req, res, next) {
    global.db.cypherQuery("MATCH (r:Repository {full_name: '" + req.params.owner + "/" + req.params.name + "'}) RETURN r", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            if (repository) {
                var github = new Github(global.config.github.options);
                github.authenticate({
                    type: 'oauth',
                    token: req.session.user.access_token
                });
                Repository.starRepository(req.session.user.info, repository, github, function (err) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.redirect('back');
                    }
                });
            }
        }
    });
};

exports.destroy = function (req, res, next) {
    console.log(req.params);
    global.db.cypherQuery("MATCH (r:Repository {full_name: '" + req.params.owner + "/" + req.params.name + "'}) RETURN r LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            if (repository) {
                var github = new Github(global.config.github.options);
                github.authenticate({
                    type: 'oauth',
                    token: req.session.user.access_token
                });
                Repository.unstarRepository(req.session.user.info, repository, github, function (err) {
                    if (err) {
                        return next(err);
                    }
                    else {
                        res.redirect('back');
                    }
                });
            }
        }
    });
};