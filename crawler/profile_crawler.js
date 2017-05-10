/**
 * Created by heavenduke on 17-5-10.
 */

var Github = require('github');
require('../website/libs').date();

module.exports = function (user, callback) {

    var fetch_relationship = function (github, user, callback) {
        github.users.getFollowingForUser({
            username: user.username,
            per_page: 50
        }).then(function(result) {
            callback(null, result.data);
        }).catch(function (err) {
            callback(err);
        });
    };

    var fetch_stars = function (github, users, accepted_repository_list, callback) {
        var cnt = 0;
        var _accepted_repository_list = {};
        var event_list = [];
        accepted_repository_list.forEach(function (ar) {
            _accepted_repository_list[ar] = ar;
        });
        users.forEach(function (user) {
            github.activity.getStarredReposForUser({username: user.login, per_page: 100}).then(function (repositories) {
                repositories.data.forEach(function (star) {
                    if (_accepted_repository_list["" + star.repo.id]) {
                        event_list.push({user_id: user.id, repository_id: star.repo.id + "", created_at: Math.floor(new Date(star.starred_at).getTime() / 1000)});
                    }
                });
                cnt++;
                if (cnt == users.length) {
                    callback(null, event_list);
                }
            }).catch(function (err) {
                return callback(err);
            });
        });
    };

    var flush_stars = function (github, relations, callback) {
        var user_list = [], repo_list = [];
        var _relations = {};
        relations.forEach(function (rl) {
            user_list.push(rl.user_id);
            repo_list.push(rl.repository_id);
            if (!_relations[rl.user_id]) {
                _relations[rl.user_id] = {};
            }
            _relations[rl.user_id][rl.repository_id] = rl.created_at;
        });

        global.db.cypherQuery("MATCH (u:User)-[s:Star]->(r:Repository) "
                            + "WHERE u.user_id IN " + JSON.stringify(user_list)
                            + " AND r.repository_id IN " + JSON.stringify(repo_list)
                            + " RETURN u.user_id as user_id, r.repository_id as repository_id, s.created_at as created_at",
            function (err, result) {
                if (err) {
                    return callback(err);
                }
                else {
                    result.data.forEach(function (rl) {
                        if (_relations[rl[0]][rl[1]]) {
                            delete _relations[rl[0]][rl[1]];
                        }
                        if (Object.keys(_relations[rl[0]]).length == 0) {
                            delete _relations[rl[0]];
                        }
                    });
                }
                var count = 0, total = Object.keys(_relations).length;
                for(var uid in _relations) {
                    var query = ["MATCH (u:User {user_id: " + uid + "})"];
                    var cnt = 0, first = true;
                    for(var rid in _relations[uid]) {
                        query.push(",(r" + cnt++ + ":Repository {repository_id: '" + rid + "'})")
                    }
                    query.push(" CREATE ");
                    cnt = 0;
                    for(rid in _relations[uid]) {
                        if (!first) {
                            query.push(",");
                        }
                        query.push("(u)-[:Star {created_at: " + _relations[uid][rid] + "}]->(r" + cnt++ + ")");
                        first = false;
                    }
                    global.db.cypherQuery(query.join(""), function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        else {
                            count++;
                            if (count == total) {
                                callback();
                            }
                        }
                    });
                }
            });
    };

    var flush_following_relations = function (user, users, callback) {
        var user_id_list = [];
        var _users = {};
        users.forEach(function (u) {
            user_id_list.push(u.id);
            _users[u.id] = u;
        });
        global.db.cypherQuery("MATCH (u:User) WHERE u.user_id IN " + JSON.stringify(user_id_list) + " RETURN u.user_id as user_id", function (err, result) {
            for(var uid in result.data) {
                delete _users["" + result.data[uid]];
            }
            if (Object.keys(_users).length != 0) {
                var query = ["MATCH (user:User {user_id: " + user.user_id + "}) CREATE "], first = true, cnt = 0;
                for (uid in _users) {
                    if (!first) {
                        query.push(',');
                    }
                    query.push("(user)-[:Follow]->(u" + cnt++ + ":User {user_id: " + _users[uid].id + ", login: '" + _users[uid].login + "', avatar_url: '" + _users[uid].avatar_url + "'})");
                    first = false;
                }
                global.db.cypherQuery(query.join(""), callback);
            }
            else {
                callback();
            }
        });
    };

    var github = new Github({
        protocol: "https",
        host: "api.github.com",
        headers: {
            Accept: "application/vnd.github.v3.star+json"
        },
        Promise: require('bluebird')
    });
    github.authenticate({
        type: "basic",
        username: user.username,
        password: user.password
    });

    fetch_relationship(github, user, function (err, followings) {
        if (err) {
            callback(err);
        }
        else {
            flush_following_relations(user, followings, function (err) {
                if (err) {
                    callback(err);
                }
                global.db.cypherQuery("MATCH (r:Repository) RETURN r.repository_id as repository_id", function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        followings.push({id: user.user_id, login: user.username});
                        fetch_stars(github, followings, result.data, function (err, list) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                flush_stars(github, list, function (err) {
                                    if (err) {
                                        callback(err);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });

};

var neo4j = require('node-neo4j');
var config = require('../config')(process.env.environment);

global.db = new neo4j(config.database.queryString);

module.exports({user_id: 6873217, username: "HeavenDuke", password: "win32.luhzu.a", following: 20, avatar_url: "https://avatars1.githubusercontent.com/u/6873217?v=3"}, function (err) {
    if (err) {
        console.log(err);
    }
});