
// Repository Crawler
// 负责按照star相关的ranking来抓取代码库，并构建language-topic-repo-user四者之间的关系
// 每分钟能执行三十次查询，也就是三千个代码库
// 每小时六十分钟，这意味着如果控制得当，一小时应该能完成一轮的更新

var Github = require('github');
var Neo4j = require('node-neo4j');
var config = require('../config')(process.env.environment);

var Crawler = function (github, db) {
    this.github = github;
    this.db = db;
    this.start = 500000;
    this.end = 100;
};

Crawler.prototype.fetch_range = function (start, end, page, callback) {
    this.github.search.repos({q: "stars:" + end + ".." + start, per_page: 100, page: page, sort: "stars"}).then(function (result) {
        callback(null, {
            items: result.data.items,
            is_last: result.meta.link.match(/rel="last"/) == null
        });
    }).catch(function (err) {
        callback(err);
    });
};

Crawler.prototype.flush_item = function (repository, callback) {
    var language = repository.language;
    var repo = {
        repository_id: repository.id,
        full_name: repository.full_name,
        stargazers_count: repository.stargazers_count,
        forks_count: repository.forks_count,
        watchers_count: repository.watchers_count,
        open_issues_count: repository.open_issues_count,
        description: repository.description.replace("'", "\\'")
    }, that = this;
    var query = "MERGE (r:Repository {repository_id: " + repo.repository_id + "})"
        + " SET r.full_name='" + repo.full_name
        + "', r.stargazers_count=" + repo.stargazers_count
        + ", r.forks_count=" + repo.forks_count
        + ", r.watchers_count=" + repo.watchers_count
        + ", r.open_issues_count=" + repo.open_issues_count
        + ", r.description='" + repo.description
        + "', r.updated=true";
    if (language) {
        query = "MATCH (l:Language {name: '" + language + "'}) " +query + " CREATE UNIQUE (r)-[:Use]->(l)";
    }
    console.log(query);
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
                        console.log("finish a repo");
                        callback();
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
                console.log("finish a repo");
                callback();
            }
        });
    }
};

Crawler.prototype.flush_batch = function (repositories, callback) {
    var index = 0, total = repositories.length, that = this;
    var temp = function () {
        that.flush_item(repositories[index], function (err) {
            if (err) {
                callback(err);
            }
            else {
                index++;
                if (index == total) {
                    callback();
                }
                else {
                    setTimeout(temp, 0);
                }
            }
        })
    };
    setTimeout(temp, 0);
};

Crawler.prototype.run = function (callback) {
    var cnt = 1, that = this, start, start_at = Date.now(), current;
    var temp = function () {
        console.log("star: from " + that.start + " to " + that.end);
        that.fetch_range(that.start, that.end, cnt, function (err, result) {
            if (err) {
                callback(err);
            }
            else {
                that.flush_batch(result.items, function (err) {
                    if (err) {
                        callback(err);
                    }
                    if (result.is_last) {
                        if (that.start == that.end) {
                            callback();
                        }
                        else {
                            that.start = start;
                            cnt = 1;
                            current = Date.now();
                            console.log(current - start_at);
                            start_at = current;
                            setTimeout(temp, 0);
                        }
                    }
                    else {
                        start = result.items[result.items.length - 1].stargazers_count;
                        cnt++;
                        current = Date.now();
                        console.log(current - start_at);
                        start_at = current;
                        setTimeout(temp, 0);
                    }
                });
            }
        });
    };
    setTimeout(temp, 0);
};

module.exports = function () {
    var github = new Github(config.github.options);
    var db = new Neo4j(config.database.queryString);
    github.authenticate(config.github.auth);
    var crawler = new Crawler(github, db);
    crawler.run(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("successfully update all top repositories");
        }
    });
};

module.exports();