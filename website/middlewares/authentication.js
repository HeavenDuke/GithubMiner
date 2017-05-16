/**
 * Created by heavenduke on 17-5-10.
 */

module.exports = function (req, res, next) {
    if (req.session.user) {
        return next();
    }
    else {
        var query = global.config.github.oauth.query();
        req.session.oauth_state = query.nonce_str;
        console.log(query);
        return res.redirect(query.url);
    }
};