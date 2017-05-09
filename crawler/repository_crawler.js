/**
 * Created by heavenduke on 17-5-7.
 */

var Github = require('github');
var neo4j = require('node-neo4j');
var config = require('../config')(this.environment);
var db = new neo4j(config.database.queryString);
var sleep = require('sleep');

var github = new Github({
    protocol: "https",
    host: "api.github.com",
    headers: {
        Accept: "application/vnd.github.mercy-preview+json"
    },
    Promise: require('bluebird')
});

// github.authenticate({
//     type: "basic",
//     username: "7@buaa.edu.cn",
//     password: "win32.luhzu.a"
// });

// github.authenticate({
//     type: "basic",
//     username: "DoubleDeckers",
//     password: "15tfosaaub_rees"
// });

github.authenticate({
    type: "basic",
    username: "githubminer18@mailinator.com",
    password: "githubgoogle20"
});

github.misc.getRateLimit({}).then(function (result) {
    console.log(result);
});

var get_repository_comparison = function (github, repository, callback) {
    github.repos.getById({id: repository.repository_id}).then(function (result) {
        var _repository = {
            name: result.data.full_name,
            stargazers_count: result.data.stargazers_count
        };
        if (_repository.name == repository.name && _repository.stargazers_count == repository.stargazers_count) {
            callback(null, result.data.topics, language)
        }
        else {
            callback({
                old: repository,
                new: _repository
            }, result.data.topics, language);
        }
    });
};

var construct_query = function (list) {
    var query = ["MATCH "], first = true;
    for(var i = 0; i < list.length; i++) {
        if (!first) {
            query.push(",");
        }
        query.push("(r" + i + ":Repository {repository_id:'" + list[i].old.repository_id + "'})");
        first = false;
    }
    first = true;
    query.push(" SET ");
    for(i = 0; i < list.length; i++) {
        if (!first) {
            query.push(",");
        }
        query.push("r" + i + ".name='" + list[i].new.name + "',r" + i + ".stargazers_count=" + list[i].new.stargazers_count + "");
        first = false;
    }
    return query.join('');
};

var flush_update_into_database = function (db, list, callback) {
    var batch_size = 100;
    var batch_num = Math.ceil(list.length / batch_size), cnt = 0;
    for(var i = 0; i < list.length; i+= batch_size) {
        db.cypherQuery(construct_query(list.slice(i, batch_size)), function (err, result) {
            if (err) {
                callback(err);
            }
            else {
                cnt++;
                if (cnt == batch_num) {
                    callback();
                }
            }
        });
    }
};


// TODO: 增加对language与topics的管理代码
var update_repository_batch = function (db, github, list, callback) {
    var update_data = [];
    var cnt = 0, i = 0;
    list.forEach(function (item) {
        function _get_repository_comparison() {
            get_repository_comparison(github, item, function (comparison, topics, language) {
                if (comparison) {
                    update_data.push(comparison);
                }
                cnt++;
                console.log(cnt);
                if (cnt == list.length) {
                    console.log("finish fetching a batch");
                    flush_update_into_database(db, update_data, callback);
                }
            });
        }
        setTimeout(_get_repository_comparison, 500 * i++);
    });
};

var update_repositories = function (db, github, list, callback) {
    var batch_size = 5000;
    var start_time = new Date(), current;
    var index = 0;
    function _update_repository_batch() {
        update_repository_batch(db, github, list.slice(index, batch_size), function () {
            console.log("finish a batch: " + index);
            current = new Date();
            if (current - start_time < 60 * 60 * 1000) {
                console.log("sleep for a while");
                sleep.msleep(60 * 61 * 1000 - (current - start_time));
            }
            start_time = new Date();
            index += batch_size;
            if (index < list.length) {
                setTimeout(_update_repository_batch, 0)
            }
            else {
                console.log("finished");
            }
        });
    }
    setTimeout(_update_repository_batch, 0);
};


var get_repository_list = function (db, callback) {
    db.cypherQuery("MATCH (r:Repository) RETURN r", function (err, result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, result.data);
        }
    });
};

// get_repository_list(db, function (err, repositories) {
//     if (err) {
//         throw err;
//     }
//     else {
//         update_repositories(db, github, repositories, function (err) {
//             if (err) {
//                 throw err;
//             }
//             else {
//                 console.log("success!");
//             }
//         });
//     }
// });