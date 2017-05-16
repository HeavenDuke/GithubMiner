/**
 * Created by heavenduke on 17-5-9.
 */

var https = require('https');
var url = require('url');
var util = require('util');

var Repository = {};

// TODO: 把这个改造成调用API的版本
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

// 封装刷新repository的代码
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
            description: repository.description
        }, that = this;
        var query = "MERGE (r:Repository {repository_id: " + repo.repository_id + "})"
            + " SET r.full_name='" + repo.full_name
            + "', r.stargazers_count=" + repo.stargazers_count
            + ", r.forks_count=" + repo.forks_count
            + ", r.watchers_count=" + repo.watchers_count
            + ", r.open_issues_count=" + repo.open_issues_count
            + ", r.description='" + repo.description.replace("'", "\\'")
            + "', r.updated=true";
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