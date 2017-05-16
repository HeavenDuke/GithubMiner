/**
 * Created by heavenduke on 17-5-16.
 */

exports.fetch_follow = function (user, worker, callback) {
    var page = 1;
    worker.users.getFollowingForUser({username: user.login, per_page: 100})
};

exports.fetch_star = function (user, worker, callback) {
    worker.users.getStarredReposForUser({username: user.login, per_page: 100})
};

exports.construct_profile = function (user, worker) {

};