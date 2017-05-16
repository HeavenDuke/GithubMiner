/**
 * Created by heavenduke on 17-5-10.
 */

module.exports = function (req, res, next) {
    if (req.session.user) {
        console.log(req.session.user);
        return next();
    }
    else {
        var query = global.config.github.oauth.query();
        req.session.nonce_str = query.nonce_str;
        return res.redirect(query.url);
    }
};