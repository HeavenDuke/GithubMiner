/**
 * Created by heavenduke on 17-2-14.
 */

var config = require('../config');
var RepoList = require('./RepoList');
var Miner = {};

/**
 * Usage: fetch a group of repo based on the given repo that contains enough repo to rank.
 * @param repository - base repository id
 * @param callback
 */
Miner.expand = function (repository, callback) {
    var list = new RepoList(config.maxLen);

};

/**
 * Usage: rank the fetched list using some magic :b
 * @param repository - base repository id
 * @param list - repository list
 * @param callback
 */
Miner.rank = function (repository, list, callback) {

};

/**
 * Usage: search relevant repo from a base repo and give a rank
 * @param repository - base repository id
 * @param callback
 */
Miner.search = function (repository, callback) {
    Miner.expand(repository, function (err, list) {
        if (err) {
            return callback(err);
        }
        Miner.rank(repository, list, function (err, rank) {
            if (err) {
                return callback(err);
            }
            return callback(rank);
        });
    });
};

module.exports = Miner;