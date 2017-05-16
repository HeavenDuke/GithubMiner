/**
 * Created by heavenduke on 17-4-28.
 */

exports.create = function (req, res, next) {
    if (req.query.code) {
        res.redirect(307, global.config.github.oauth.query_token(null, req.session.nonce_str, req.query.code));
    }
    else if (req.query.access_token) {
        console.log(access_token);
    }
};

exports.destroy = function (req, res, next) {
    delete req.session.user
};