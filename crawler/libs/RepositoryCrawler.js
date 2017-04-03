/**
 * Created by heavenduke on 17-4-2.
 */

var Octokat = require('octokat');

var RepositoryCrawler = function (config) {
    this.octo = new Octokat(config);
};

RepositoryCrawler.prototype.fetchTopStarred = function (config, page, callback) {
    var query = "stars:" + config.minimum + ".." + config.maximum;
    this.octo.search.repositories.fetch({q: query, sort: "stars", order: "desc", per_page: 100, page: page}).then(function (result) {
        callback(result);
    });
};

RepositoryCrawler.prototype.fetchOwner = function (username, repository, callback) {
    return this.octo.repos(username, repository).owner.fetch().then(function (result) {
        callback(result);
    });
};

RepositoryCrawler.prototype.fetchStargazer = function (username, repository, page, callback) {
    return this.octo.repos(username, repository).stargazers.fetch({page: page, per_page: 100}).then(function (result) {
        callback(result);
    });
};

RepositoryCrawler.prototype.fetchDetail = function (username, repository) {
    return this.octo.repos(username, repository).fetch();
};

RepositoryCrawler.prototype.fetchTopic = function (username, repository) {
    return this.octo.repos(username, repository).fetch();
};

module.exports = RepositoryCrawler;