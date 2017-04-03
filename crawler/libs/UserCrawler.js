/**
 * Created by heavenduke on 17-4-2.
 */

var Octokat = require('octokat');
var url = require('url');

var UserCrawler = function (config) {
    this.octo = new Octokat(config);
};

UserCrawler.prototype.fetchTopFollowed = function (config, page, callback) {
    var query = "followers:" + config.minimum + ".." + config.maximum;
    this.octo.search.users.fetch({q: query, sort: "followers", order: "desc", per_page: 100, page: page}).then(function (result) {
        callback(result);
    });
};

UserCrawler.prototype.fetchDetail = function (username, callback) {
    this.octo.users(username).fetch().then(function (result) {
        callback(result);
    });
};

UserCrawler.prototype.fetchFollowersCount = function (username, callback) {
    this.octo.users(username).followers.fetch({per_page: 1}).then(function (followers) {
        var pageUrl = url.parse(followers.lastPage.url, true);
        callback(parseInt(pageUrl.query.page));
    });
};

UserCrawler.prototype.fetchFollowingsCount = function (username, callback) {
    this.octo.users(username).following.fetch({per_page: 1}).then(function (following) {
        if (!following.nextPage) {
            return callback(following.items.length);
        }
        else {
            var pageUrl = url.parse(following.lastPage.url, true);
            callback(parseInt(pageUrl.query.page));
        }
    });
};

UserCrawler.prototype.fetchStarredCount = function (username, callback) {
    this.octo.users(username).starred.fetch({per_page: 1}).then(function (starred) {
        if (!starred.nextPage) {
            return callback(starred.items.length);
        }
        else {
            var pageUrl = url.parse(starred.lastPage.url, true);
            callback(parseInt(pageUrl.query.page));
        }
    });
};

UserCrawler.prototype.fetchStarred = function (username, page, callback) {
    return this.octo.users(username).starred.fetch({page: page, per_page: 100}).then(function (result) {
        var data = {
            finished: false,
            data: result
        };
        if (!result.nextPage) {
            data.finished = true;
        }
        callback(data);
    });
};

module.exports = UserCrawler;