/**
 * Created by heavenduke on 17-4-28.
 */

exports.create = function (req, res, next) {
    if (req.query.access_token) {

    }
    else {

    }
};

exports.destroy = function (req, res, next) {
    delete req.session.user
};