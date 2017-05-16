/**
 * Created by heavenduke on 17-4-28.
 */

var Repository = require('../../libs').repository;

var Github = require('github');

var github = new Github({
    protocol: "https",
    host: "api.github.com",
    headers: {
        Accept: "application/vnd.github.mercy-preview+json"
    },
    Promise: require('bluebird')
});

github.authenticate({
    type: "basic",
    username: "DoubleDeckers",
    password: "15tfosaaub_rees"
});

// TODO: 重写这个接口的lazy update功能
exports.show = function (req, res, next) {
    global.db.cypherQuery("MATCH (r:Repository {repository_id: " + req.params.repository_id + "})-[:Use]->(l:Language) RETURN r, l.name LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            console.log(result.data);
            var repository = result.data[0][0];
            repository.language = result.data[0][1];
            if (repository && (repository.updated == true || !req.session.user)) {
                Repository.getReadme(repository.name, repository.default_branch, function (readme) {
                    return res.render("repository/show", {
                        title: repository.name,
                        info: req.flash('info'),
                        error: req.flash('error'),
                        repository: repository,
                        readme: readme
                    });
                });
            }
            else {
                var worker;
                if (req.session.user) {

                    Repository.getRepository(req.query.name, null, worker, function () {
                        Repository.getReadme(repository.full_name, repository.default_branch, function (readme) {
                            repository.name = repository.full_name;
                            repository.repository_id = repository.id;
                            res.render("repository/show", {
                                title: repository.full_name,
                                info: req.flash('info'),
                                error: req.flash('error'),
                                repository: repository,
                                readme: readme
                            });
                        });
                    });
                }
                else {
                    global.master.get_worker(function (w) {
                        worker = w;
                        Repository.getRepository(req.query.name, null, worker, function () {
                            Repository.getReadme(repository.full_name, repository.default_branch, function (readme) {
                                repository.name = repository.full_name;
                                repository.repository_id = repository.id;
                                res.render("repository/show", {
                                    title: repository.full_name,
                                    info: req.flash('info'),
                                    error: req.flash('error'),
                                    repository: repository,
                                    readme: readme
                                });
                            });
                        });
                    })
                }
            }
        }
    });
};