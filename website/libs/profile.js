/**
 * Created by heavenduke on 17-5-16.
 */

var fetch_follow = function (user, worker, callback) {
    var page = 1;
    function temp () {
        function flush_batch(id, users, callback) {
            var cnt = 0;
            function temp2() {
                var query = "MATCH (u0:User {user_id: " + id + "})"
                    + " MERGE (u:User {user_id: " + users[cnt].id + "})"
                    + " SET u.login='" + users[cnt].login + "',"
                    + " u.avatar_url='" + users[cnt].avatar_url
                    + " CREATE UNIQUE (u0)-[:Follow]->(u)";
                global.db.cypherQuery(query, function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        cnt++;
                        if (cnt == users.length) {
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

        worker.users.getFollowingForUser({username: user.login, per_page: 100, page: page}).then(function (result) {
            flush_batch(user.user_id, result.data, function (err) {
                if (err) {
                    return callback(err);
                }
                if (result.meta.link.match(/rel="last"/) == null) {
                    return callback();
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

var fetch_starred = function (user, worker, callback) {
    var page = 1;
    function temp () {
        function flush_batch(id, repositories, callback) {
            var cnt = 0;
            function temp2() {
                var query = "MATCH (u:User {user_id: " + id + "})"
                    + " MERGE (r:Repository {repository_id: " + repositories[cnt].id + "})"
                    + " SET r.full_name='" + repositories[cnt].full_name
                    + "', r.stargazers_count=" + repositories[cnt].stargazers_count
                    + ", r.forks_count=" + repositories[cnt].forks_count
                    + ", r.watchers_count=" + repositories[cnt].watchers_count
                    + ", r.open_issues_count=" + repositories[cnt].open_issues_count
                    + ", r.description='" + repositories[cnt].description.replace("'", "\\'")
                    + "', r.default_branch='" + repo.default_branch
                    + "', r.updated=true" + (repositories[cnt].language ? ",r.language='" + repositories[cnt].language + "'" : "")
                    + " CREATE UNIQUE (u)-[:Star {type: 'Star'}]->(r)";
                global.db.cypherQuery(query, function (err, result) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        cnt++;
                        if (cnt == repositories.length) {
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

        worker.activity.getStarredReposForUser({username: user.login, per_page: 100, page: page}).then(function (result) {
            flush_batch(user.user_id, result.data, function (err) {
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

exports.construct_profile = function (user, worker, callback) {
    var state = {
        follow: false,
        starred: false,
        isFinished: function () {
            return this.follow && this.starred;
        }
    };
    fetch_follow(user, worker, function (err) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        state.follow = true;
        if (state.isFinished()) {
            callback();
        }
    });
    fetch_starred(user, worker, function (err) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        state.follow = true;
        if (state.isFinished()) {
            callback();
        }
    });
};