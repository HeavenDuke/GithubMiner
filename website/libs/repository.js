/**
 * Created by heavenduke on 17-5-9.
 */

var https = require('https');
var url = require('url');
var util = require('util');

var Repository = {};

Repository.getReadme = function (name, worker, callback) {
    worker.repos.getReadme({owner: name.split('/')[0], repo: name.split('/')[1]}).then(function (result) {
        callback(result.data);
    }).catch(function (err) {
        callback();
    });
};

Repository.getStargazers = function (repository, worker, callback) {
    var page = 1;
    function temp () {
        function flush_batch(id, records, callback) {
            var cnt = 0;
            function temp2() {
                var query = "MATCH (r:Repository {repository_id: " + id + "})"
                    + " MERGE (u:User {user_id: " + records[cnt].user.id + "})"
                    + " SET u.login='" + records[cnt].user.login + "',"
                    + " u.avatar_url='" + records[cnt].user.avatar_url
                    + "' CREATE UNIQUE (u)-[:Star {type: 'Star', created_at: " + Math.round(Date.parse(records[cnt].starred_at) / 1000) + "}]->(r)";
                global.db.cypherQuery(query, function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        cnt++;
                        if (cnt == records.length) {
                            callback();
                        }
                        else {
                            setTimeout(temp2, 0);
                        }
                    }
                });
            }
            setTimeout(temp2, 0);
        }

        worker.activity.getStargazersForRepo({owner: repository.full_name.split('/')[0], repo: repository.full_name.split('/')[1], per_page: 100, page: page}).then(function (result) {
            console.log(result);
            flush_batch(repository.repository_id, result.data, function (err) {
                if (err) {
                    return callback(err);
                }
                if (result.meta.link.match(/rel="last"/) == null) {
                    callback();
                }
                else {
                    page++;
                    setTimeout(temp, 0);
                }
            });
        }).catch(function (err) {
            callback(err);
        });
    }
    setTimeout(temp, 0);
};

Repository.starRepository = function (user, repository, worker, callback) {
    worker.activity.starRepo({owner: repository.full_name.split('/')[0], repo: repository.full_name.split('/')[1]}).then(function () {
        var query = "MATCH (u:User {user_id: " + user.user_id + "}),"
            + "(r:Repository {repository_id: " + repository.repository_id + "})"
            + " CREATE UNIQUE (u)-[:Star]->(r)";
        global.db.cypherQuery(query, callback);
    }).catch(function (err) {
        callback(err);
    });
};

Repository.unstarRepository = function (user, repository, worker, callback) {
    worker.activity.unstarRepo({owner: repository.full_name.split('/')[0], repo: repository.full_name.split('/')[1]}).then(function () {
        var query = "MATCH (:User {user_id: " + user.user_id + "})-[r:Star]->(:Repository {repository_id: " + repository.repository_id + "}) DELETE r";
        global.db.cypherQuery(query, callback);
    }).catch(function (err) {
        callback(err);
    });
};

Repository.getRepository = function (name, id, worker, callback) {
    var flush_item = function (repository, callback) {
        var language = repository.language;
        var repo = {
            repository_id: repository.id,
            full_name: repository.full_name,
            stargazers_count: repository.stargazers_count,
            forks_count: repository.forks_count,
            watchers_count: repository.watchers_count,
            open_issues_count: repository.open_issues_count,
            description: repository.description ? repository.description.replace(/'/g, "\\'") : "",
            language: repository.language,
            default_branch: repository.default_branch
        }, that = this;
        var query = "MERGE (r:Repository {repository_id: " + repo.repository_id + "})"
            + " SET r.full_name='" + repo.full_name
            + "', r.stargazers_count=" + repo.stargazers_count
            + ", r.forks_count=" + repo.forks_count
            + ", r.watchers_count=" + repo.watchers_count
            + ", r.open_issues_count=" + repo.open_issues_count
            + ", r.description='" + repo.description
            + "', r.default_branch='" + repo.default_branch
            + "', r.updated=true" + (repo.language ? ",r.language='" + repo.language + "'" : "");
        if (language) {
            query = "MATCH (l:Language {name: '" + language + "'}) " +query + " CREATE UNIQUE (r)-[:Use]->(l) RETURN r";
        }
        else {
            query += " RETURN r";
        }
        if (language) {
            that.db.cypherQuery("MERGE (:Language {name: '" + language + "'})", function (err, result) {
                if (err) {
                    callback(err);
                }
                else {
                    that.db.cypherQuery(query, function (err, result) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            callback(null, result.data[0], language);
                        }
                    });
                }
            });
        }
        else {
            that.db.cypherQuery(query, function (err, result) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, result.data[0], language);
                }
            });
        }
    };

    if (name) {
        worker.repos.get({owner: name.split('/')[0], repo: name.split('/')[1]}).then(function (result) {
            flush_item(result.data, callback);
        }).catch(function (err) {
            callback(err);
        });
    }
    else {
        worker.repos.getById({id: id}).then(function (result) {
            flush_item(result.data, callback);
        }).catch(function (err) {
            callback(err);
        });
    }
};

module.exports = Repository;