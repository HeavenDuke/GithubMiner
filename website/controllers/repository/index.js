/**
 * Created by heavenduke on 17-4-28.
 */

var Repository = require('../../libs').repository;

var Github = require('github');

exports.show = function (req, res, next) {
    global.db.cypherQuery("MATCH (r:Repository {full_name: '" + req.params.owner + "/" + req.param.name + "'})-[:Use]->(l:Language) RETURN r, l.name LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0] ? result.data[0][0] : null;
            if (repository && (repository.updated == true || !req.session.user)) {
                repository.language = result.data[0][1];
                Repository.getReadme(repository.name, repository.default_branch, function (readme) {
                    return res.render("repository/show", {
                        title: repository.name,
                        info: req.flash('info'),
                        error: req.flash('error'),
                        repository: repository,
                        user: req.session.user,
                        readme: readme
                    });
                });
            }
            else {
                var worker;
                if (req.session.user) {
                    worker = new Github(global.config.github.options);
                    worker.authenticate({
                        type: "oauth",
                        token: req.session.user.access_token
                    });
                    Repository.getRepository(req.params.owner + "/" + req.params.name, null, worker, function (err, repository, language) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            repository.language = language;
                            Repository.getReadme(repository.full_name, repository.default_branch, function (readme) {
                                repository.repository_id = repository.id;
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
                }
                else {
                    global.master.get_worker(function (w) {
                        worker = w;
                        Repository.getRepository(req.params.owner + "/" + req.params.name, null, worker, function (err, repository, language) {
                            if (err) {
                                return next(err);
                            }
                            else {
                                Repository.getReadme(repository.full_name, repository.default_branch, function (readme) {
                                    repository.repository_id = repository.id;
                                    repository.language = language;
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
                    })
                }
            }
        }
    });
};