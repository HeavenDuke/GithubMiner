/**
 * Created by heavenduke on 17-4-28.
 */

var Repository = require('../../libs').repository;
var Profile = require('../../libs').profile;

var Github = require('github');

exports.show = function (req, res, next) {
    global.db.cypherQuery("MATCH (r:Repository {full_name: '" + req.params.owner + "/" + req.params.name + "'}) RETURN r LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            if (repository && repository.updated == true) {
                var worker;
                if (req.session.user) {
                    var options = JSON.parse(JSON.stringify(global.config.github.options));
                    options.headers.Accept = "application/vnd.github.v3.star+json";
                    worker = new Github(options);
                    worker.authenticate({
                        type: "oauth",
                        token: req.session.user.access_token
                    });
                    global.db.cypherQuery("MATCH (u:User {user_id: " + req.session.user.info.id + "})-[s:Star]->(r:Repository {repository_id: " + repository.repository_id + "}) RETURN s", function (err, result) {
                        if (err) {
                            return next(err);
                        }
                        var starred = result.data.length != 0;
                        Repository.getReadme(repository.full_name, worker, function (readme) {
                            Profile.record_action(req.session, repository);
                            return res.render("repository/show", {
                                title: repository.name,
                                info: req.flash('info'),
                                error: req.flash('error'),
                                repository: repository,
                                starred: starred,
                                user: req.session.user,
                                readme: readme
                            });
                        });
                    });
                }
                else {
                    global.master.get_worker(function (w) {
                        worker = w;
                        Repository.getReadme(repository.full_name, worker, function (readme) {
                            Profile.record_action(req.session, repository);
                            res.render("repository/show", {
                                title: repository.full_name,
                                info: req.flash('info'),
                                error: req.flash('error'),
                                repository: repository,
                                user: req.session.user,
                                readme: readme
                            });
                        });
                    });
                }
            }
            else {
                if (req.session.user) {
                    options = JSON.parse(JSON.stringify(global.config.github.options));
                    options.headers.Accept = "application/vnd.github.v3.star+json";
                    worker = new Github(options);
                    worker.authenticate({
                        type: "oauth",
                        token: req.session.user.access_token
                    });
                    Repository.getRepository(req.params.owner + "/" + req.params.name, null, worker, function (err, repository) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            global.db.cypherQuery("MATCH (u:User {user_id: " + req.session.user.info.id + "})-[s:Star]->(r:Repository {repository_id: " + repository.repository_id + "}) RETURN s", function (err, result) {
                                if (err) {
                                    return next(err);
                                }
                                var starred = result.data.length != 0;
                                Repository.getStargazers(repository, worker, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                Repository.getReadme(repository.full_name, worker, function (readme) {
                                    Profile.record_action(req.session, repository);
                                    return res.render("repository/show", {
                                        title: repository.name,
                                        info: req.flash('info'),
                                        error: req.flash('error'),
                                        repository: repository,
                                        starred: starred,
                                        user: req.session.user,
                                        readme: readme
                                    });
                                });
                            });
                        }
                    });
                }
                else {
                    global.master.get_worker(function (w) {
                        worker = w;
                        Repository.getRepository(req.params.owner + "/" + req.params.name, null, worker, function (err, repository) {
                            if (err) {
                                return next(err);
                            }
                            else {
                                Repository.getReadme(repository.full_name, worker, function (readme) {
                                    Profile.record_action(req.session, repository);
                                    res.render("repository/show", {
                                        title: repository.full_name,
                                        info: req.flash('info'),
                                        error: req.flash('error'),
                                        repository: repository,
                                        user: req.session.user,
                                        readme: readme
                                    });
                                });
                            }
                        });
                    });
                }
            }
        }
    });
};

exports.stars = require('./star');