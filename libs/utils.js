/**
 * Created by heavenduke on 17-2-14.
 */

var Octokat = require('octokat');
var config = require('../config');
var Libs = {};

/**
 *
 * @param repo
 * @param callback
 */
Libs.getRelevantUserList = function (repo, callback) {
    var userList = {}, list = [];
    var cnt = 0, num = 2;
    repo.stargazers.fetch().then(function (result) {
        var users = result.items;
        for(var i = 0; i < users.length; i++) {
            userList[users[i].id] = users[i];
        }
        if (++cnt >= num) {
            for(var key in userList) {
                list.push(userList[key]);
            }
            callback(null, list);
        }
    });
    repo.contributors.fetch().then(function (result) {
        var users = result.items;
        for(var i = 0; i < users.length; i++) {
            userList[users[i].id] = users[i];
        }
        if (++cnt >= num) {
            for(var key in userList) {
                list.push(userList[key]);
            }
            callback(null, list);
        }
    });
};

/**
 *
 * @param user
 * @param callback
 */
Libs.getRelevantRepoList = function (user, callback) {
    var repoList = {}, list = [];
    var cnt = 0, num = 2;
    user.starred.fetch().then(function (result) {
        var repositories = result.items;
        for(var i = 0; i < repositories.length; i++) {
            repoList[repositories[i].id] = repositories[i];
        }
        if (++cnt >= num) {
            for(var key in repoList) {
                list.push(repoList[key]);
            }
            callback(null, list);
        }
    });
    user.repos.fetch().then(function (result) {
        var repositories = result.items;
        for(var i = 0; i < repositories.length; i++) {
            repoList[repositories[i].id] = repositories[i];
        }
        if (++cnt >= num) {
            for(var key in repoList) {
                list.push(repoList[key]);
            }
            callback(null, list);
        }
    });
};

/**
 *
 * @param repo
 * @param callback
 */
Libs.searchRepo = function (repo, callback) {
    var octo = new Octokat(config.basicUser);
    var repoList = {}, list = [];
    octo.search.repositories.fetch({q: repo.name}).then(function (result) {
        var repositories = result.items;
        for(var i = 0; i < repositories.length; i++) {
            repoList[repositories[i].id] = repositories[i];
        }
        for(var key in repoList) {
            list.push(repoList[key]);
        }
        return callback(null, list);
    });
};

/**
 *
 * @param repo
 * @param callback
 */
Libs.getRepositories = function (repo, callback) {
    var repoList = {}, list = [];
    var counter = 0, num = 2;
    Libs.getRelevantUserList(repo, function (err, users) {
        if (err) {
            return callback(err);
        }
        var cnt = 0;
        for(var i = 0; i < users.length; i++) {
            Libs.getRelevantRepoList(users[i], function (err, repositories) {
                if (err) {
                    return callback(err);
                }
                for(var j = 0; j < repositories.length; j++) {
                    repoList[repositories[j].id] = repositories[j];
                }
                if (++cnt >= users.length) {
                    if (++counter >= num) {
                        for(var key in repoList) {
                            list.push(repoList[key]);
                        }
                        return callback(null, list);
                    }
                }
            });
        }
    });
    Libs.searchRepo(repo, function (err, repositories) {
        if (err) {
            return callback(err);
        }
        for(var j = 0; j < repositories.length; j++) {
            repoList[repositories[j].id] = repositories[j];
        }
        if (++counter >= num) {
            for(var key in repoList) {
                list.push(repoList[key]);
            }
            return callback(null, list);
        }
    });
};

/**
 *
 * @param list1
 * @param list2
 * @returns {number}
 */
Libs.calculateCosine = function (list1, list2) {
    console.log(list1, list2);
    var table = {}, sum = 0;
    for(var i = 0; i < list1.length; i++) {
        table[list1[i].id] = 1;
    }
    for(i = 0; i < list2.length; i++) {
        table[list2[i].id] = 0;
    }
    for(var key in table) {
        sum += 1 - table[key];
    }
    console.log(sum / Math.sqrt(list1.length * list2.length));
    return sum / Math.sqrt(list1.length * list2.length);
};

/**
 *
 * @param repo1
 * @param repo2
 * @param callback
 */
Libs.getSimilarity = function (repo1, repo2, callback) {
    var list1 = null, list2 = null;
    Libs.getRelevantUserList(repo1, function (err, users) {
        if (err) {
            return callback(err);
        }
        list1 = users;
        if (list2) {
            callback(null, Libs.calculateCosine(list1, list2));
        }
    });
    Libs.getRelevantUserList(repo2, function (err, users) {
        if (err) {
            return callback(err);
        }
        list2 = users;
        if (list1) {
            callback(null, Libs.calculateCosine(list1, list2));
        }
    });
};

module.exports = Libs;