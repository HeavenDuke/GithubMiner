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
    global.db.cypherQuery("MATCH (t:Topic)<-[:Have]-(r:Repository {repository_id: '" + req.params.repository_id + "'}), (r:Repository {repository_id: '" + req.params.repository_id + "'})<-[:Have]-(l:Language) RETURN r, collect(t.name) ,l.name LIMIT 1", function (err, result) {
        if (err) {
            return next(err);
        }
        else {
            var repository = result.data[0][0];
            repository.language = result.data[0][2];
            repository.topics = result.data[0][1];
            if (repository) {
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
                function construct_query(repository) {
                    var result = "MATCH (r:Repository {repository_id: '" + repository.id + "'}) CREATE UNIQUE ";
                    var first = true;
                    if (repository.language) {
                        result += "(:Language {name: '" + repository.language + "'})-[:Have]->(r)";
                        first = false;
                    }
                    if (repository.topics instanceof Array && repository.topics.length != 0) {
                        repository.topics.forEach(function (topic) {
                            if (!first) {
                                result += ","
                            }
                            result += "(:Topic {name: '" + topic + "'})<-[:Have]-(r)";
                            first = false;
                        });
                    }
                    console.log(result);
                    return result;
                }
                github.repos.getById({id: req.params.repository_id}).then(function (result) {
                    repository = result.data;
                    console.log(repository);
                    global.db.cypherQuery("CREATE (r:Repository {repository_id: '" + repository.id
                        + "', name: '" + repository.full_name
                        + "', stargazers_count: " + repository.stargazers_count
                        + ", watchers_count: " + repository.watchers_count
                        + ", forks_count: " + repository.forks_count
                        + ", open_issues_count: " + repository.open_issues_count
                        + ", default_branch: '" + repository.default_branch
                        + "', description: '" + (repository.description ? repository.description.replace("'", "\\'") : "") + "'}) return r", function (err, result) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            global.db.cypherQuery(construct_query(repository), function (err, result) {
                                if (err) {
                                    return next(err);
                                }
                                else {
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
                                }
                            });
                        }
                    });
                });
            }
        }
    });
};