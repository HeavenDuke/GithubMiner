/**
 * Created by heavenduke on 17-4-2.
 */

// var sleep = require('sleep');
var Crawlers = require('./libs');
var config = require('./config')(process.env.environment);

// var repositoryCrawler = new Crawlers.RepositoryCrawler(config.authentication.basic);
var previewRepositoryCrawler = new Crawlers.RepositoryCrawler(config.authentication.preview);
var userCrawler = new Crawlers.UserCrawler(config.authentication.preview);

var searchRepository = function (callback) {
    var Repository = database.models.repository;
    // var count = 0, startTime = Date.now();
    var page = 1, total = 0, periodTotal = 0;
    var repoConfig = config.repository;
    function search() {
        // if (Date.now() - startTime < 60 * 1000 && count >= 30) {
        //     count = 0;
        //     startTime = Date.now();
        //     sleep.msleep(60 * 1000);
        // }
        previewRepositoryCrawler.fetchTopStarred(repoConfig, page, function (result) {
            if (result.items.length != 0) {
                var _reposData = {}, reposData = [];
                var repoIds = [];
                result.items.forEach(function (repo) {
                    _reposData[repo.id] = {
                        repositoryId: repo.id,
                        name: repo.name,
                        owner: repo.owner.login,
                        description: repo.description,
                        stargazers_count: repo.stargazersCount,
                        watchers_count: repo.watchersCount,
                        forks_count: repo.forksCount,
                        open_issues_count: repo.openIssuesCount,
                        createdAt: new Date(repo.createdAt),
                        updatedAt: new Date(repo.updatedAt)
                    };
                    repoIds.push(repo.id);
                });
                Repository.findAll({where: {repositoryId: {$in: repoIds}}}).then(function (repos) {
                    repos.forEach(function (repo) {
                        delete _reposData[repo.repositoryId];
                    });
                    for(var key in _reposData) {
                        reposData.push(_reposData[key]);
                    }
                    Repository.bulkCreate(reposData, {validate: false}).then(function () {
                        page++;
                        total += result.items.length;
                        periodTotal += result.items.length;
                        console.log("finish crawling repository brief - " + total + " currently.");
                        if (periodTotal == 1000) {
                            repoConfig.maximum = result.items[result.items.length - 1].stargazersCount;
                            console.log("max pagination limit met - reset maximum starcount to " + repoConfig.maximum);
                            periodTotal = 0;
                            page = 1;
                        }
                        setTimeout(search, 1);
                    });
                });
            }
            else {
                callback();
            }
        });
    }
    setTimeout(search, 1);
};

var searchUser = function (callback) {
    var User = database.models.user;
    // var count = 0, startTime = Date.now();
    var page = 1, total = 0, periodTotal = 0;
    var userConfig = config.user;
    function search() {
        // if (Date.now() - startTime < 60 * 1000 && count >= 30) {
        //     count = 0;
        //     startTime = Date.now();
        //     sleep.msleep(60 * 1000);
        // }
        userCrawler.fetchTopFollowed(userConfig, page, function (result) {
            if (result.items.length != 0) {
                var _usersData = {}, usersData = [];
                var userIds = [];
                result.items.forEach(function (user) {
                    _usersData[user.id] = {
                        userId: user.id,
                        login: user.login,
                        avatar: user.avatarUrl
                    };
                    userIds.push(user.id);
                });
                User.findAll({where: {userId: {$in: userIds}}}).then(function (users) {
                    users.forEach(function (user) {
                        delete _usersData[user.userId];
                    });
                    for(var key in _usersData) {
                        usersData.push(_usersData[key]);
                    }
                    User.bulkCreate(usersData, {validate: false}).then(function () {
                        page++;
                        total += result.items.length;
                        periodTotal += result.items.length;
                        console.log("finish crawling user brief - " + total + " currently.");
                        if (periodTotal == 1000) {
                            userCrawler.fetchFollowersCount(result.items[result.items.length - 1].login, function (count) {
                                userConfig.maximum = count;
                                console.log("max pagination limit met - reset maximum follower count to " + userConfig.maximum);
                                periodTotal = 0;
                                page = 1;
                                setTimeout(search, 1);
                            });
                        }
                        else {
                            setTimeout(search, 1);
                        }
                    });
                });
            }
            else {
                callback();
            }
        });
    }
    setTimeout(search, 1);
};

var updateUser = function () {
    var User = database.models.user;
    var count = 0, startTime = Date.now(), rate = 0;
    // function updateRate() {
    //     rate++;
    //     if (Date.now() - startTime <= 60 * 60 * 1000 && rate >= 5000) {
    //         sleep.msleep(60 * 60 * 1000 -(Date.now() - startTime));
    //         startTime = Date.now();
    //         rate = 0;
    //     }
    // }
    User.findAll({where: {followers_count : 0}}).then(function (users) {
        function search() {
            if (users.length != count) {
                userCrawler.fetchDetail(users[count].login, function (user) {
                    // updateRate();
                    userCrawler.fetchFollowersCount(users[count].login, function (followersCount) {
                        // updateRate();
                        userCrawler.fetchFollowingsCount(users[count].login, function (followingsCount) {
                            // updateRate();
                            userCrawler.fetchStarredCount(users[count].login, function (starredCount) {
                                // updateRate();
                                var res = {
                                    email: user.email,
                                    name: user.name,
                                    company: user.company,
                                    blog: user.blog,
                                    location: user.location,
                                    followers_count: followersCount,
                                    followees_count: followingsCount,
                                    starred_count: starredCount
                                };
                                User.update(res, {
                                    where: {login: users[count].login}
                                }).then(function () {
                                    count++;
                                    console.log("finish update user info No." + count + " username = " + users[count].login);
                                    setTimeout(search, 1);
                                });
                            });
                        });
                    });
                });
            }
        }
        setTimeout(search, 1);
    });
};

var fetchStar = function () {
    var Repository = database.models.repository;
    var User = database.models.user;
    var Star = database.models.star;
    var count = 0, startTime = Date.now(), rate = 0, page = 1, total_page = 1;
    // function updateRate() {
    //     rate++;
    //     if (Date.now() - startTime <= 60 * 60 * 1000 && rate >= 5000) {
    //         sleep.msleep(60 * 60 * 1000 -(Date.now() - startTime));
    //         startTime = Date.now();
    //         rate = 0;
    //     }
    // }
    User.findAll({}).then(function (users) {
        function search() {
            function searchSingle() {
                userCrawler.fetchStarred(users[count].login, page, function (repositories) {
                    // updateRate();
                    var finished = repositories.finished;
                    repositories = repositories.data;
                    var repoIds = [];
                    repositories.items.forEach(function (repo) {
                        repoIds.push(repo.id);
                    });
                    Repository.findAll({where: {repositoryId: {$in: repoIds}}}).then(function (repositories) {
                        var starData = [];
                        repositories.forEach(function (repo) {
                            starData.push({
                                userId: users[count].userId,
                                repositoryId: repo.repositoryId
                            });
                        });
                        Star.bulkCreate(starData).then(function () {
                            console.log("finish fetch starred repository for user No." + count + '(page = ' + page + ')');
                            if (!finished) {
                                page++;
                                setTimeout(searchSingle, 1);
                            }
                            else {
                                console.log("finish fetch starred repository for user No." + count);
                                count++;
                                page = 1;
                                if (count < users.length) {
                                    setTimeout(search, 1);
                                }
                            }
                        });
                    });
                });
            }
            setTimeout(searchSingle, 1);
        }
        setTimeout(search, 1);
    });
};

var database = require('../database')(
    config.database.dbname,
    config.database.username,
    config.database.password,
    config.database.config
);

// Note: 如果是从头开始运行爬虫，请使用这部分
// database.sync().then(function () {
//     var status = {
//         repo: false,
//         user: false,
//         initFinished: function () {
//             return this.repo && this.user
//         }
//     };
//     searchRepository(function () {
//         status.repo = true;
//         if (status.initFinished()) {
//             updateUser();
//             fetchStar();
//         }
//     });
//     searchUser(function () {
//         status.user = true;
//         if (status.initFinished()) {
//             updateUser();
//             fetchStar();
//         }
//     });
// });

// Note: 如果是从头开始运行爬虫，请注释掉这部分
database.sync().then(function () {
    updateUser();
    fetchStar();
});

