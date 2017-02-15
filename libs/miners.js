/**
 * Created by heavenduke on 17-2-14.
 */

var utils = require('./utils');
var Miner = {};

/**
 * Usage: fetch a group of repo based on the given repo that contains enough repo to rank.
 * @param repository - base repository id
 * @param callback
 */
Miner.expand = function (repository, callback) {
    utils.getRepositories(repository, function (err, repositories) {
        if (err) {
            return callback(err);
        }
        return callback(null, repositories);
    });
};

/**
 * Usage: rank the fetched list using some magic :b
 * @param repository - base repository id
 * @param list - repository list
 * @param callback
 */
Miner.rank = function (repository, list, callback) {
    return callback(null, list);
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
            return callback(null, rank);
        });
    });
};

module.exports = Miner;