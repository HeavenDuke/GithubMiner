var Github = require('github');
var RepositoryCrawler = {};

RepositoryCrawler.master = {};

RepositoryCrawler.slave = {};

var master = RepositoryCrawler.master;


// master.run = function (accounts) {
//     query = "MATCH (r:Repository) FROM "
// };

var slave = RepositoryCrawler.slave;

slave.run = function (account, batch, db, callback) {
    var github = new Github({
        protocol: "https",
        host: "api.github.com",
        headers: {
            "user-agent": "HeavenDuke",
            "Accept": "application/vnd.github.mercy-preview+json"
        },
        Promise: require('bluebird')
    });
    var cnt = 0, total = batch.length;
    github.authenticate({
        type: "basic",
        username: account.username,
        password: account.password
    });

    var update_repository = function (repository, repository_new) {
        var status = {
            basic: false,
            topics: false,
            language: false,
            finished: function () {
                return this.basic && this.topics && this.language;
            }
        };

        // UPDATE BASIC INFO
        var query = "MATCH (r:Repository {repository_id: '" + repository.repository_id + "'}) "
                  + "SET r.name='" + repository_new.full_name
                  + "', r.stargazers_count=" + repository_new.stargazers_count
                  + ", r.description='" + repository_new.description.replace("'", "\\'")
                  + "', r.watchers_count=" + repository_new.watchers_count
                  + ", r.forks_count=" + repository_new.forks_count
                  + ", r.default_branch='" + repository_new.default_branch
                  + "', r.open_issues_count=" + repository_new.forks_count;
        db.cypherQuery(query, function (err, result) {
            if (err) {
                return callback(err);
            }
            status.basic = true;
            if (status.finished()) {
                cnt++;
                console.log(cnt);
                if (cnt == total) {
                    return callback();
                }
            }
        });

        // UPDATE LANGUAGE INFO
        // 如果原本有和一门语言的关联，那么删掉这个关联
        // 如果新的这个语言已经存在，那么直接创建边，否则创建语言之后再创建边
        query = "MATCH p=(r:Repository {repository_id: '" + repository.repository_id + "'})<-[rl:Have]-(l:Language),(t:Language {name: '" + repository_new.language + "'}) DELETE rl RETURN count(t)";
        db.cypherQuery(query, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (repository_new.language != null) {
                if (result.data[0][0] == 0) {
                    query = "MATCH (r:Repository {repository_id: '" + repository.repository_id + "'}) CREATE (r)<-[:Have]-(l:Language {name: '" + repository_new.language + "'})";
                }
                else {
                    query = "MATCH (r:Repository {repository_id: '" + repository.repository_id + "'}),(l:Language {name: '" + repository_new.language + "'}) CREATE (r)<-[:Have]-(l)";
                }
                db.cypherQuery(query, function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    status.language = true;
                    if (status.finished()) {
                        cnt++;
                        console.log(cnt);
                        if (cnt == total) {
                            return callback();
                        }
                    }
                });
            }
        });

        // UPDATE TOPIC INFO
        query = "MATCH p=(r:Repository {repository_id: '" + repository.repository_id + "'})<-[rl]-(t:Topic),(tp:Topic) DELETE rl RETURN tp.name";
        db.cypherQuery(query, function (err, result) {
            if (err) {
                return callback(err);
            }
            if (repository_new.topics.length != 0) {
                var _topics = {};
                repository_new.topics.forEach(function (topic) {
                    _topics[topic] = topic;
                });
                result.data.forEach(function (topic) {
                    delete _topics[topic];
                });
                _topics = Object.keys(_topics);
                if (_topics.length != 0) {
                    query = "CREATE ";
                    var first = true, _cnt = 0;
                    _topics.forEach(function (topic) {
                        if (!first) {
                            query += ",";
                        }
                        query += "(:Topic {name: '" + topic + "'})";
                        first = false;
                    });
                    db.cypherQuery(query, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        query = "MATCH (r:Repository {repository_id: '" + repository.repository_id + "'})";
                        repository_new.topics.forEach(function (topic) {
                            query += ",(t" + _cnt++ + " {name: '" + topic + "'})";
                        });
                        _cnt = 0;
                        first = true;
                        query += " CREATE ";
                        repository_new.topics.forEach(function (topic) {
                            if (!first) {
                                query += ",";
                            }
                            query += "(t" + _cnt++ + ")-[:Have]->(r)";
                            first = false;
                        });
                        db.cypherQuery(query, function (err, result) {
                            if (err) {
                                return callback(err);
                            }
                            status.topics = true;
                            if (status.finished()) {
                                cnt++;
                                console.log(cnt);
                                if (cnt == total) {
                                    return callback();
                                }
                            }
                        });
                    });
                }
                else {
                    query = "MATCH (r:Repository {repository_id: '" + repository.repository_id + "'})";
                    repository_new.topics.forEach(function (topic) {
                        query += ",(t" + _cnt++ + " {name: '" + topic + "'})";
                    });
                    _cnt = 0;
                    first = true;
                    query += " CREATE ";
                    repository_new.topics.forEach(function (topic) {
                        if (!first) {
                            query += ",";
                        }
                        query += "(t" + _cnt++ + ")-[:Have]->(r)";
                        first = false;
                    });
                    db.cypherQuery(query, function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        status.topics = true;
                        if (status.finished()) {
                            cnt++;
                            console.log(cnt);
                            if (cnt == total) {
                                return callback();
                            }
                        }
                    });
                }
            }
        });
    };

    var generate_update_function = function (github, repository) {
        return function () {
            github.repos.getById({id: repository.repository_id}).then(function (result) {
                var repository_new = result.data;
                update_repository(repository, repository_new);
            }).catch(function (err) {
                return callback(err);
            });
        };
    };

    for(var i = 0; i < total; i++) {
        setTimeout(generate_update_function(github, batch[i]), i * 300);
    }
};

var neo4j = require('node-neo4j');
var config = require('../config')(process.env.environment);

var db = new neo4j(config.database.queryString);

db.cypherQuery("MATCH (r:Repository) RETURN r LIMIT 100", function (err, result) {
    if (err) {
        throw err;
    }
    slave.run({username: "HeavenDuke", password: "win32.luhzu.a"}, result.data, db, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

module.exports = RepositoryCrawler;