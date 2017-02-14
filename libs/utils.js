/**
 * Created by heavenduke on 17-2-14.
 */

var Set = require('set');
var Libs = {};

/**
 *
 * @param repo
 * @param callback
 */
Libs.getRelevantUserList = function (repo, callback) {

};

/**
 *
 * @param user
 * @param callback
 */
Libs.getRelevantRepoList = function (user, callback) {

};

/**
 *
 * @param repo
 * @param callback
 */
Libs.searchRepo = function (repo, callback) {

};

/**
 *
 * @param repo
 * @param options
 * @param callback
 */
Libs.getRepositories = function (repo, options, callback) {

};

/**
 *
 * @param list1
 * @param list2
 * @returns {number}
 */
Libs.calculateCosine = function (list1, list2) {
    var set1 = new Set(list1), set2 = new Set(list2);
    var intersect = set1.intersect(set2);
    return intersect.size() / Math.sqrt(set1.size() * set2.size());
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
        if (list2) {
            callback(null, Libs.calculateCosine(list1, list2));
        }
    });
};

module.exports = Libs;