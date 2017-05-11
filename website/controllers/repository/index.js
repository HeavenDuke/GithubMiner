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

exports.show = function (req, res, next) {
    global.db.cypherQuery("MATCH (r:Repository {repository_id: '" + req.params.repository_id + "'}) RETURN r LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0];
            if (repository) {
                Repository.getReadme(repository.name, repository.default_branch, function (readme) {
                    res.render("repository/show", {
                        title: repository.name,
                        info: req.flash('info'),
                        error: req.flash('error'),
                        repository: repository,
                        readme: readme
                    });
                });
            }
            else {
                github.repos.getById({id: req.params.repository_id}).then(function (result) {
                    repository = result.data;
                    // TODO: USE CREATE UNIQUE TO CONSTRUCT RELATIONS BETWEEN REPOSITORY AND LANGUAGE/TOPICS
                    global.db.cypherQuery(
                        "CREATE (r:Repository {repository_id: '" + repository.id
                        + "', name: '" + repository.full_name
                        + "', stargazers_count: " + repository.stargazers_count
                        + ", watchers_count: " + repository.watchers_count
                        + ", forks_count: " + repository.forks_count
                        + ", open_issues_count: " + repository.open_issues_count
                        + ", default_branch: '" + repository.default_branch
                        + "', description: '" + repository.description.replace("'", "\\'") + "'}), topic", function (err, result) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            repository = result.data[0];
                            Repository.getReadme(repository.name, repository.default_branch, function (readme) {
                                res.render("repository/show", {
                                    title: repository.name,
                                    info: req.flash('info'),
                                    error: req.flash('error'),
                                    repository: repository,
                                    readme: readme
                                });
                            });
                        }
                    });
                });
            }
        }
    });
};